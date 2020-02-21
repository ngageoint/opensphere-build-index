(function() {
  // The resource limit error has been observed when loading ~2000 scripts, so reduce concurrency to avoid that. If the
  // limit is still reached, reduce this further.
  const concurrencyLimit = 500;

  let nextIndex = 0;
  let pending = 0;

  let scriptsContent;
  let scriptPaths;

  const moduleRegex = /\ngoog\.module\('[^']+'\);\n/;
  const manifestPath = '.build/gcc-manifest';

  /**
   * Load the next script.
   */
  const loadNext = function() {
    const scriptIndex = nextIndex++;
    const next = scriptPaths[scriptIndex];
    if (next) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', next);

      /**
       * Handle script load.
       * @param {ProgressEvent} e The event.
       */
      xhr.onload = (e) => {
        pending--;

        if (xhr.responseText) {
          let content;
          if (moduleRegex.test(`\n${xhr.responseText}`)) {
            content = transformModule(xhr.responseText, next);
          } else {
            content = `${xhr.responseText}\n//# sourceURL=${next}\n`;
          }

          scriptsContent[scriptIndex] = content;

          if (pending) {
            // Load the next script.
            loadNext();
          } else {
            scriptsContent.forEach(addToDocument);

            // Dump everything for good measure.
            scriptsContent.length = 0;
            scriptPaths.length = 0;
          }
        } else {
          throw new Error(`Failed loading script: empty/unexpected response for ${next}`);
        }
      };
      /**
       * Handle script load error.
       */
      xhr.onerror = () => {
        throw new Error(`Failed loading script: XHR failed with code ${xhr.status} for ${next}`);
      };
      xhr.send();
    }
  };

  /**
   * Add script content to the document.
   * @param {string} content The content.
   */
  const addToDocument = (content) => {
    // Borrowed from goog.globalEval
    const scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.defer = false;
    scriptEl.appendChild(document.createTextNode(content));
    document.head.appendChild(scriptEl);
    document.head.removeChild(scriptEl);
  };

  /**
   * Transform goog.module content so it's loaded properly.
   * @param {string} content The content.
   * @param {string} path The file path.
   * @return {string} The transformed content.
   */
  const transformModule = (content, path) => {
    const jsonContent = JSON.stringify(`${content}\n//# sourceURL=${path}\n`);
    return `goog.loadModule(${jsonContent});`;
  };

  const xhr = new XMLHttpRequest();

  /**
   * Handle manifest load.
   * @param {ProgressEvent} e The event.
   */
  xhr.onload = (e) => {
    if (!xhr.response || typeof xhr.response !== 'string') {
      throw new Error(`Failed loading test script manifest: empty/unexpected response for  ${manifestPath}`);
    }

    scriptPaths = xhr.response.trim().split('\n').map((path) => {
      return path.replace(/^.*\/workspace\//, '../').replace(/^.*\/node_modules\//, '../../node_modules/');
    });

    // Cache content for all scripts until everything has been loaded. This allows async XHR, but sync script loading.
    scriptsContent = new Array(scriptPaths.length);
    pending = scriptPaths.length;

    // Queue scripts, up to the concurrency limit.
    const n = scriptPaths.length;
    for (let i = 0; i < n && i < concurrencyLimit; i++) {
      loadNext();
    }
  };

  /**
   * Handle manifest load error.
   */
  xhr.onerror = () => {
    throw new Error(`Failed loading test script manifest: XHR failed with code ${xhr.status}`);
  };
  xhr.open('GET', manifestPath);
  xhr.responseType = 'text';
  xhr.send();
})();

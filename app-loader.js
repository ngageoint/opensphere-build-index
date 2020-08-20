(function() {
  // The resource limit error has been observed when loading ~2000 scripts, so reduce concurrency to avoid that. If the
  // limit is still reached, reduce this further.
  const concurrencyLimit = 500;

  //
  // Match goog.module files. Uses the 'm' flag to support files with preceding comments, while still matching the
  // statement from the start of a line.
  //
  const googModuleRegex = /^goog\.module\('.*'\);/m;

  //
  // Match ES6 module files. Uses the 'm' flag to support files with preceding comments, while still matching the
  // statement from the start of a line.
  //
  const es6ModuleRegex = /^export /m;

  //
  // Match the module id declared by goog.declareModuleId.
  //
  const declareModuleIdRegex = /^goog\.declareModuleId\('([^']+)'\);$/m;

  //
  // Closure Compiler manifest containing the ordered list of files to load.
  //
  const manifestPath = window.GCC_MANIFEST_PATH;
  if (!manifestPath) {
    throw new Error('Path to debug scripts was not provided!');
  }

  // remove the global before loading scripts
  delete window.GCC_MANIFEST_PATH;

  let nextIndex = 0;
  let pending = 0;

  let scriptsContent;
  let scripts;

  /**
   * Load the next script.
   */
  const loadNext = function() {
    const scriptIndex = nextIndex++;
    const next = scripts[scriptIndex];
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
          if (es6ModuleRegex.test(xhr.responseText)) {
            const moduleId = xhr.responseText.match(declareModuleIdRegex);
            content = () => {
              let oldModuleState;

              // Callback to fire before the module is loaded.
              const beforeKey = goog.Dependency.registerCallback_(function() {
                goog.Dependency.unregisterCallback_(beforeKey);

                // Let Closure know we're loading an ES6 module.
                oldModuleState = goog.moduleLoaderState_;
                goog.moduleLoaderState_ = {
                  type: goog.ModuleType.ES6
                };
              });
              addModuleToDocument(`goog.Dependency.callback_('${beforeKey}')`);

              // Load the original module.
              addModuleToDocument(undefined, next);

              // Callback to fire after the module is loaded.
              const afterKey = goog.Dependency.registerCallback_(function() {
                goog.Dependency.unregisterCallback_(afterKey);

                // Restore the previous module state and load the next script.
                goog.moduleLoaderState_ = oldModuleState;
                addNextScriptToPage();
              });

              // Import the module and add its exports to Closure.
              addModuleToDocument(`
                import * as m from '${next}';
                const moduleName = '${moduleId ? moduleId[1] : undefined}';
                if (moduleName) {
                  goog.loadedModules_[moduleName] = {
                    exports: m,
                    type: goog.ModuleType.ES6,
                    moduleId: moduleName || ''
                  };
                }
                goog.Dependency.callback_('${afterKey}')
              `.trim());
            };
          } else if (googModuleRegex.test(`\n${xhr.responseText}`)) {
            content = transformModule(xhr.responseText, next);
          } else {
            content = `${xhr.responseText}\n//# sourceURL=${next}\n`;
          }

          scriptsContent[scriptIndex] = content;

          if (pending) {
            // Load the next script.
            loadNext();
          } else {
            nextIndex = 0;
            addNextScriptToPage();
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

  const addNextScriptToPage = () => {
    const scriptIndex = nextIndex++;
    const next = scriptsContent[scriptIndex];
    if (next) {
      if (typeof next === 'string') {
        addToDocument(next);
        addNextScriptToPage();
      } else {
        next();
      }
    } else {
      // Dump everything for good measure.
      scriptsContent.length = 0;
      scripts.length = 0;
    }
  };

  const addModuleToDocument = (content, src) => {
    const scriptEl = document.createElement('script');
    scriptEl.type = 'module';
    scriptEl.defer = true;
    scriptEl.async = false;
    scriptEl.setAttribute('crossorigin', true);

    if (content) {
      scriptEl.appendChild(document.createTextNode(content));
    } else {
      scriptEl.src = src;
    }

    document.head.appendChild(scriptEl);
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
    if (!Array.isArray(xhr.response) || !xhr.response.length) {
      throw new Error(`Failed loading test script manifest: empty/unexpected response for  ${manifestPath}`);
    }

    scripts = xhr.response;

    // Cache content for all scripts until everything has been loaded. This allows async XHR, but sync script loading.
    scriptsContent = new Array(scripts.length);
    pending = scripts.length;

    // Queue scripts, up to the concurrency limit.
    const n = scripts.length;
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
  xhr.responseType = 'json';
  xhr.send();
})();

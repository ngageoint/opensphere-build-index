/**
 * Chrome limits outstanding requests per render process to consume up to 25MB of memory. That limit may be exceeded
 * by debug builds due to the number of initial script loads from the index. This loader limits the number of scripts
 * that will be concurrently loaded to avoid hitting the resource limit.
 *
 * @see https://codereview.chromium.org/18541
 */
(function() {
  var scriptsPath = window.DEBUG_SCRIPTS_PATH;
  if (!scriptsPath) {
    throw new Error('Path to debug scripts was not provided!');
  }

  // remove the global before loading scripts
  delete window.DEBUG_SCRIPTS_PATH;

  // the resource limit error has been observed when loading ~2000 scripts, so reduce concurrency to avoid that. if the
  // limit is still reached, reduce this further.
  var concurrencyLimit = 500;
  var scripts;

  var loadNext = function() {
    var next = scripts.shift();
    if (next) {
      //
      // Setting async to false ensures scripts are loaded in the order they are added to the page. When a script
      // finishes loading, move on to the next script in the list.
      //
      var script = document.createElement('script');
      script.async = false;
      script.src = next;
      script.onload = loadNext;

      document.body.appendChild(script);
    }
  };

  var loadScripts = function() {
    var n = scripts.length;
    for (var i = 0; i < n && i < concurrencyLimit; i++) {
      loadNext();
    }
  };

  var xhr = new XMLHttpRequest();

  /**
   * Handle XHR load of debug scripts.
   * @param {Event} e The load event.
   */
  xhr.onload = function(e) {
    if (xhr.status === 200 && Array.isArray(xhr.response)) {
      scripts = xhr.response;
      loadScripts();
    } else {
      throw new Error('Failing loading debug scripts: XHR failed with code ' + xhr.status);
    }
  };

  /**
   * Handle XHR error loading debug scripts.
   * @param {Event} e The error event.
   */
  xhr.onerror = function(e) {
    throw new Error('Failing loading debug scripts: XHR failed with code ' + xhr.status);
  };
  xhr.open('GET', scriptsPath);
  xhr.responseType = 'json';
  xhr.send();
})();

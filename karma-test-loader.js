/**
 * Script loader for Karma. This loader reads input files from the test manifest and defers starting Karma until all
 * scripts have finished loading.
 *
 * To use this loader, the Karma configuration must do the following:
 *  - Load all files in the manifest with `served: true` and `included: false`.
 *  - Load the test manifest with `served: true` and `included: false`.
 *  - Load this file with `included: true`.
 *  - Add a proxy for `/karma-test-scripts` that points to `gcc-test-manifest`.
 *
 * Chrome limits outstanding requests per render process to consume up to 25MB of memory. That limit may be exceeded
 * due to the number of initial script loads on the page. This loader limits the number of scripts that will be
 * concurrently loaded to avoid hitting the resource limit.
 *
 * @see https://codereview.chromium.org/18541
 */
(function() {
  const MOCK_REGEXP = /\.mock\.js$/;
  const TEST_REGEXP = /\.test\.js$/;

  // The Karma configuration must add a proxy to point this at `gcc-test-manifest`.
  const scriptsPath = '/karma-test-scripts';

  // The resource limit error has been observed when loading ~2000 scripts, so reduce concurrency to avoid that. If the
  // limit is still reached, reduce this further.
  const concurrencyLimit = 500;
  let pending = 0;
  let scripts;

  /**
   * Clear the loaded handler installed by Jasmine, so Karma can be manually started when the loader is done.
   */
  window.__karma__.loaded = function() {};

  /**
   * Load the next script in the list.
   */
  const loadNext = function() {
    const next = scripts.shift();
    if (next) {
      //
      // Setting async to false ensures scripts are loaded in the order they are added to the page. When a script
      // finishes loading, move on to the next script in the list.
      //
      const script = document.createElement('script');
      script.async = false;
      script.src = next;

      /**
       * Handle script load.
       */
      script.onload = function() {
        pending--;

        if (pending) {
          // Load the next script.
          loadNext();
        } else {
          // Done loading scripts, start Karma.
          window.__karma__.start();
        }
      };

      document.body.appendChild(script);
    }
  };

  const xhr = new XMLHttpRequest();

  /**
   * Handle XHR load of test scripts.
   * @param {Event} e The load event.
   */
  xhr.onload = function(e) {
    if (xhr.status !== 200) {
      throw new Error('Failing loading test scripts: XHR failed with code ' + xhr.status);
    }

    if (!xhr.response || typeof xhr.response !== 'string') {
      throw new Error('Failing loading test scripts: empty/unexpected response for ' + scriptsPath);
    }

    const deps = [];
    const mocks = [];
    const tests = [];

    // Load source files, then mocks, then tests.
    const files = xhr.response.split('\n');
    files.forEach(function(file) {
      file = file.trim();

      if (file) {
        if (MOCK_REGEXP.test(file)) {
          mocks.push(file);
        } else if (TEST_REGEXP.test(file)) {
          tests.push(file);
        } else {
          deps.push(file);
        }
      }
    });
    scripts = deps.concat(mocks, tests);
    pending = scripts.length;

    // Queue scripts, up to the concurrency limit.
    const n = scripts.length;
    for (let i = 0; i < n && i < concurrencyLimit; i++) {
      loadNext();
    }
  };

  /**
   * Handle XHR error loading test scripts.
   * @param {Event} e The error event.
   */
  xhr.onerror = function(e) {
    throw new Error('Failing loading test scripts: XHR failed with code ' + xhr.status);
  };
  xhr.open('GET', scriptsPath);
  xhr.responseType = 'text';
  xhr.send();
})();

/* eslint-disable */
/**
 * Closure's goog.module.declareLegacyNamespace behavior does not handle the case where a parent namespace is loaded
 * after a child namespace. When the parent is loaded, it will be blindly assigned to window.<namespace> which will
 * wipe out anything previously assigned by child namespaces.
 *
 * Example:
 *   - "os.ns" is loaded, which defines window.os.ns = <exports>.
 *   - "os" is loaded, which defines window.os = <exports>. window.os.ns is now gone.
 *
 * This problem only impacts modules that need legacy support.
 */
(function() {
  var getExistingExports = function() {
    if (goog.moduleLoaderState_.moduleName) {
      var moduleParts = goog.moduleLoaderState_.moduleName.split('.');
      var current = window;
      while (moduleParts.length && current.hasOwnProperty(moduleParts[0])) {
        current = current[moduleParts.shift()];
        if (!moduleParts.length) {
          return current;
        }
      }
    }
    return undefined;
  };

  goog.loadModuleFromSource_ = /** @type {function(string):?} */ (function() {
    'use strict';
    var exports = {};
    eval(arguments[0]);
    // if declareLegacyNamespace was called, the module's exports will be set at the module's namespace on the global
    // window object. if that object already exists, merge the exports into it and set that as the exports.
    var __existingExports__ = getExistingExports();
    if (goog.moduleLoaderState_.declareLegacyNamespace && __existingExports__ &&
        Object.getPrototypeOf(exports) === Object.prototype) {
      Object.assign(__existingExports__, exports);
      exports = __existingExports__;
    }
    return exports;
  });
})();

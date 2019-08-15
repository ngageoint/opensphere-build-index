const expect = require('chai').expect;

describe('Karma test loader', function() {
  const addedChildren = [];
  let xhr = null;
  let err = null;

  const expectedScriptPath = '/karma-test-scripts';
  const numScripts = 1000;
  const scripts = [];
  for (let i = 0; i < numScripts; i++) {
    scripts.push(`test/script${i}.js`);
    scripts.push(`test/script${i}.mock.js`);
    scripts.push(`test/script${i}.test.js`);
  }

  const MockXMLHttpRequest = function() {
    xhr = this;

    this.responseType = '';
    this.status = 0;
    this.response = null;

    this.lastMethod = null;
    this.lastPath = null;
  };
  MockXMLHttpRequest.prototype.open = function(method, path) {
    this.lastMethod = method;
    this.lastPath = path;
  };
  MockXMLHttpRequest.prototype.send = function() {
    this.response = scripts.join('\n');
    this.status = 200;
    this.onload();
  };

  const karmaLoaded = function() {};

  let karmaStarted = false;
  const startKarma = function() {
    karmaStarted = true;
  };


  beforeEach(function() {
    err = null;
    addedChildren.length = 0;
    karmaStarted = false;

    global.__karma__ = {
      loaded: karmaLoaded,
      start: startKarma
    };

    global.document = {
      body: {
        appendChild: function(script) {
          addedChildren.push(script);
          script.onload();
        }
      },
      createElement: function(type) {
        return {};
      }
    };

    global.window = {
      __karma__: {
        loaded: karmaLoaded,
        start: startKarma
      }
    };
  });

  it('throws an error if the script cant be loaded', function() {
    try {
      require('../karma-test-loader.js');
    } catch (e) {
      err = e;
    }

    expect(err).to.exist;
  });

  it('loads a list of scripts', function() {
    global.XMLHttpRequest = MockXMLHttpRequest;

    require('../karma-test-loader.js');

    // loaded call should be replaced
    expect(global.window.__karma__.loaded).not.to.equal(karmaLoaded);
    // Karma should be started
    expect(karmaStarted).to.equal(true);

    // XHR set up correctly
    expect(xhr).to.exist;
    expect(xhr.responseType).to.equal('text');
    expect(xhr.lastMethod).to.equal('GET');
    expect(xhr.lastPath).to.equal(expectedScriptPath);
    expect(xhr.response).to.exist;

    // all scripts have been loaded
    expect(addedChildren.length).to.equal(scripts.length);

    for (let i = 0; i < addedChildren.length; i++) {
      const child = addedChildren[i];
      expect(child.async).to.equal(false);
      expect(child.onload).to.exist;

      // scripts should be sorted as scripts -> mocks -> tests
      if (i < numScripts) {
        expect(child.src).to.equal(scripts[i * 3]);
      } else if (i < numScripts * 2) {
        expect(child.src).to.equal(scripts[i % numScripts * 3 + 1]);
      } else {
        expect(child.src).to.equal(scripts[i % numScripts * 3 + 2]);
      }
    }

    try {
      err = null;
      xhr.status = 404;
      xhr.onload();
    } catch (e) {
      err = e;
    }

    expect(err).to.exist;

    try {
      err = null;
      expect(xhr.onerror).to.exist;
      xhr.onerror();
    } catch (e) {
      err = e;
    }

    expect(err).to.exist;
  });
});

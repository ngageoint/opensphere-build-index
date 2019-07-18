const expect = require('chai').expect;

describe('debug loader', function() {
  let xhr = null;

  const numScripts = 1000;
  const scripts = [];
  for (let i = 0; i < numScripts; i++) {
    scripts.push(`test/script${i}.js`);
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
    this.response = scripts.slice();
    this.status = 200;
    this.onload();
  };

  it('throws an error if the script path is not defined', function() {
    let err = null;
    try {
      global.window = {};
      require('../debug-loader.js');
    } catch (e) {
      err = e;
    }

    expect(err).to.exist;
  });

  it('loads a list of scripts', function() {
    const jsonPath = 'debug-loader.test.json';
    let err = null;

    const children = [];
    global.document = {
      body: {
        appendChild: function(script) {
          children.push(script);
          script.onload();
        }
      },
      createElement: function(type) {
        return {};
      }
    };

    global.window = {
      DEBUG_SCRIPTS_PATH: jsonPath
    };
    global.XMLHttpRequest = MockXMLHttpRequest;

    require('../debug-loader.js');

    // deletes the global property
    expect(window.DEBUG_SCRIPTS_PATH).to.not.exist;

    // XHR set up correctly
    expect(xhr).to.exist;
    expect(xhr.responseType).to.equal('json');
    expect(xhr.lastMethod).to.equal('GET');
    expect(xhr.lastPath).to.equal(jsonPath);
    expect(xhr.response).to.exist;
    expect(xhr.response.length).to.equal(0);

    // each script loaded in order
    expect(children.length).to.equal(scripts.length);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      expect(child.async).to.equal(false);
      expect(child.src).to.equal(scripts[i]);
      expect(child.onload).to.exist;
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

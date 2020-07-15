# [3.2.0](https://github.com/ngageoint/opensphere-build-index/compare/v3.1.1...v3.2.0) (2020-07-15)


### Features

* **goog:** add closure mixin to fix debug load of legacy modules ([020913d](https://github.com/ngageoint/opensphere-build-index/commit/020913dbebcbb20ca631da15cd2b980069bae9d4))

## [3.1.1](https://github.com/ngageoint/opensphere-build-index/compare/v3.1.0...v3.1.1) (2020-02-25)


### Bug Fixes

* **debug:** generate manifest in debug-only builds (no gcc-manifest) ([35c4434](https://github.com/ngageoint/opensphere-build-index/commit/35c44341b0fcff267485563a00f8e2a34df547b1))

# [3.1.0](https://github.com/ngageoint/opensphere-build-index/compare/v3.0.3...v3.1.0) (2020-02-24)


### Bug Fixes

* **debug:** provide manifest path to debug loader ([e69119d](https://github.com/ngageoint/opensphere-build-index/commit/e69119de5d66eacdc9d03fdbd97b14ab33bedaa8))


### Features

* **debug:** add debug app loader with goog.module support ([b038f37](https://github.com/ngageoint/opensphere-build-index/commit/b038f37e1fb2877bcaa45c0ed478fa4a8efc4fbd))
* **debug:** improve goog.module regex ([8c0158a](https://github.com/ngageoint/opensphere-build-index/commit/8c0158ae85b3abcf87fd9f2730b1235e9a20d6da))

## [3.0.3](https://github.com/ngageoint/opensphere-build-index/compare/v3.0.2...v3.0.3) (2020-02-05)


### Bug Fixes

* **gcc:** update closure deps ([6ef8d64](https://github.com/ngageoint/opensphere-build-index/commit/6ef8d640b2e758d36fa5348d447a009b167a756f))

## [3.0.2](https://github.com/ngageoint/opensphere-build-index/compare/v3.0.1...v3.0.2) (2020-01-31)


### Bug Fixes

* **goog:** resolve the closure library from the cwd first ([6c5ddb8](https://github.com/ngageoint/opensphere-build-index/commit/6c5ddb895a5e3bebb42a1d05c07c42d75573e7dd))

## [3.0.1](https://github.com/ngageoint/opensphere-build-index/compare/v3.0.0...v3.0.1) (2019-12-09)


### Bug Fixes

* **debug:** create the debug loader once ([8fd5f5f](https://github.com/ngageoint/opensphere-build-index/commit/8fd5f5f1ff57d7a0b02841c213e3f1f5135098a1))

# [3.0.0](https://github.com/ngageoint/opensphere-build-index/compare/v2.2.2...v3.0.0) (2019-11-27)


### Bug Fixes

* **loader:** throw an error if the debug loader promise is rejected ([6304edd](https://github.com/ngageoint/opensphere-build-index/commit/6304edd3d62d83c6604786cfe1c1514722425a38))


### Features

* **debug:** replace debug loader with Closure's ([e52e856](https://github.com/ngageoint/opensphere-build-index/commit/e52e856bd5c1e2923869f23da718c56f5504402d))


### BREAKING CHANGES

* **debug:** The debug loader has been removed in favor of generating
Closure dependencies and using goog.bootstrap. While this requires no changes
to existing index templates, it is a significant change to how applications
load in debug mode so a major version update seems warranted.

## [2.2.2](https://github.com/ngageoint/opensphere-build-index/compare/v2.2.1...v2.2.2) (2019-08-15)


### Bug Fixes

* **debug:** fix detection of JS tags in debug template ([2f086ba](https://github.com/ngageoint/opensphere-build-index/commit/2f086ba))

## [2.2.1](https://github.com/ngageoint/opensphere-build-index/compare/v2.2.0...v2.2.1) (2019-08-15)


### Bug Fixes

* handle win32 paths ([974af8f](https://github.com/ngageoint/opensphere-build-index/commit/974af8f))

# [2.2.0](https://github.com/ngageoint/opensphere-build-index/compare/v2.1.0...v2.2.0) (2019-08-02)


### Features

* **karma:** Add script loader for Karma unit testing. ([dc0e686](https://github.com/ngageoint/opensphere-build-index/commit/dc0e686))

# [2.1.0](https://github.com/ngageoint/opensphere-build-index/compare/v2.0.0...v2.1.0) (2019-07-18)


### Features

* **debug:** Use a script loader in the debug index. ([41c45af](https://github.com/ngageoint/opensphere-build-index/commit/41c45af))

# [2.0.0](https://github.com/ngageoint/opensphere-build-index/compare/v1.1.0...v2.0.0) (2018-06-26)


### Features

* **buildindex:** exit on errors ([23490e1](https://github.com/ngageoint/opensphere-build-index/commit/23490e1)), closes [#1](https://github.com/ngageoint/opensphere-build-index/issues/1)


### BREAKING CHANGES

* **buildindex:** process now exits on errors

<a name="1.1.0"></a>
# [1.1.0](https://github.com/ngageoint/opensphere-build-index/compare/v1.0.0...v1.1.0) (2018-01-17)


### Features

* **template:** use template file paths if provided ([ca7396b](https://github.com/ngageoint/opensphere-build-index/commit/ca7396b))

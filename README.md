# opensphere-build-index

Generates index HTML files for Google Closure projects.

## Usage
Install it as a dependency of your package: `npm install opensphere-build-index --save-dev`

Create an `index.js` file in the project root as described below, then invoke by
calling `os-index` from node.

## Index.js Configuration

The application should create an `index.js` file in its project root that
exports the following:

```javascript
module.exports = {
  // the application version string
  appVersion: string,

  // base path for the application
  basePath: string,

  // path to the distribution directory, relative to basePath
  distPath: string,

  // path to the compiled application CSS file, relative to distPath
  compiledCss: string,

  // path to the compiled application JavaScript file, relative to distPath
  compiledJs: string,

  // path to the debug application CSS file, relative to basePath
  debugCss: (string|undefined),

  // HTML templates to process
  templates: [
    {
      // unique identifier for the template
      id: string,

      // resources that need to be loaded by the application/template
      resources: [
        {
          // absolute path to the directory containing the resources
          source: string,

          // relative path to copy the resources
          // resources will be copied to <distPath>/<version>/<target>
          target: (string|undefined),

          // array of JavaScript files to both copy and include in a <script> tag
          scripts: (Array<string>|undefined),

          // array of CSS files to both copy and include in a <link> tag
          css: (Array<string>|undefined),

          // array of glob patterns for additional files that must be copied but
          // not included in the index.html
          files: (Array<string>|undefined)
        }
      ]
    }
  ]
};
```

## Template

Each specified template `id` must have a corresponding `id-template.html` file
in the base directory.

The template at minimum should contain commented blocks identifying where to
insert vendor and application content.

The following comment tags will be replaced with content from the index:
* `VENDOR_CSS`: `<link>` elements generated from `resources.css` files.
* `VENDOR_JS`: `<script>` elements generated from `resources.scripts` files.
* `APP_CSS`: The `compiledCss`/`debugCss` file.
* `APP_JS`: The `compiledJs` script, or scripts to set up and run the debug loader.

In addition, the following will be replaced:
* `@appVersion@`: The `appVersion` string in the index.
* `@version@`: Path to the version directory.

These properties will be available on the main Angular scope.

### Sample Template

```html
<!DOCTYPE html>
<title>My App</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
<meta charset="UTF-8">
<!--VENDOR_CSS-->
<!--APP_CSS-->
<div id="ng-app" ng-init="version='@appVersion@';versionPath='@version@'">
  <my-app></my-app>
</div>
<!--VENDOR_JS-->
<!--APP_JS-->
```

## About

[OpenSphere](https://github.com/ngageoint/opensphere) was developed at the National Geospatial-Intelligence Agency (NGA) in collaboration with BIT Systems. The government has "unlimited rights" and is releasing this software to increase the impact of government investments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the Apache license.

## Pull Requests

If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the Apache license.

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.

## License

Copyright 2017 BIT Systems

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

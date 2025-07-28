# metalsmith-markdown-partials

A Metalsmith plugin that enables the use of Markdown partials.

[![metalsmith: plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![license: MIT][license-badge]][license-url]
[![coverage][coverage-badge]][coverage-url]
[![ESM/CommonJS][modules-badge]][npm-url]
[![Known Vulnerabilities](https://snyk.io/test/npm/metalsmith-markdown-partials/badge.svg)](https://snyk.io/test/npm/metalsmith-markdown-partials)

Markdown fragments are inserted into the contents of a page markdown file by replacing an include marker with markdown partials. This allows for modular markdown and promotes reuse of content.

## Features
- This plugin supports both ESM and CommonJS environments with no configuration needed:
  - ESM: `import mdPartials from 'metalsmith-markdown-partials'`
  - CommonJS: `const mdPartials = require('metalsmith-markdown-partials')`

## Installation

```js
$ npm install --save metalsmith-markdown-partials
```

## Usage

```js
.use(mdPartials({
    libraryPath: './markdown-partials/',
    fileSuffix: '.md.njk',
  }))
...

```

## Options

**libraryPath**

The default libraryPath is `./markdown-partials/`. This default assumes that all pages are located in `./src/` so the markdown partials are located inside the metalsmith source directory.

```js
const mdPartials = require('metalsmith-markdown-partials');

metalsmith(__dirname)
  .use(mdPartials({
    libraryPath: './markdown-partials/'
  })
```

**fileSuffix**

The default fileSuffix is `.md`, but depending on which templating language is used, the suffix will have two parts. For example for Nunjucks it will be `md.njk`.

```js
const mdPartials = require('metalsmith-markdown-partials').use(
  mdPartials({
    fileSuffix: '.md.njk'
  })
);
```

## How it works

### Include marker

```
{#md "<file name>.md" #}
```

### Page Markdown File

A markdown file that will be transformed into an html file via a template

### Markdown Partial

A markdown file to be inserted into a Page Markdown file

Markdown partials are located in a separate directory, for example `/markdown-library/`. This directory should be located inside `/src/` .

Partial markdown files have the extention `.md`. A markdown partial file does NOT have frontmatter metadata, only the markdown to be inserted into a page markdown file.

The markdown partials directory's default location is `./src/markdown-library/`. The partials directory can be set via the libraryPath option.

## Example

**index.md**

```markdown
# This is an Example Page

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.

{#md "example_partial.md" #}

Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
```

**example_partial.md**

```markdown
## Inserted Content

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.
```

**index.html**

```html
<h1>This is an Example Page</h1>

<p>
  Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta
  gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec
  elit.
</p>

<h2>Inserted Content</h2>
<p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.</p>

<p>
  Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.
  Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus.
</p>
```

## Debug

To enable debug logs, set the `DEBUG` environment variable to `metalsmith-markdown-partials`:

Linux/Mac:

```
DEBUG=metalsmith-markdown-partials
```

Windows:

```
set "DEBUG=metalsmith-markdown-partials"
```

### CLI usage

To use this plugin with the Metalsmith CLI, add `metalsmith-markdown-partials` to the `plugins` key in your `metalsmith.json` file:

```json
{
  "plugins": [
    {
      "metalsmith-markdown-partials": {
        "libraryPath": "./markdown-partials/",
        "fileSuffix": ".md.njk"
      }
    }
  ]
}
```

## Test Coverage

This project maintains high statement and line coverage for the source code. Coverage is verified during the release process using the c8 coverage tool.

## Author

[werner@glinka.co](https://github.com/wernerglinka)

## License

Code released under [the MIT license](https://github.com/wernerglinka/metalsmith-markdown-partials/blob/main/LICENSE).

[npm-badge]: https://img.shields.io/npm/v/metalsmith-markdown-partials.svg
[npm-url]: https://www.npmjs.com/package/metalsmith-markdown-partials
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[license-badge]: https://img.shields.io/github/license/wernerglinka/metalsmith-markdown-partials
[license-url]: LICENSE
[coverage-badge]: https://img.shields.io/badge/test%20coverage-95%25-brightgreen
[coverage-url]: #test-coverage
[modules-badge]: https://img.shields.io/badge/modules-ESM%2FCJS-blue

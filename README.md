# metalsmith-markdown-partials

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![license: ISC][license-badge]][license-url]

This Metalsmith plugin enables the use of Markdown partials, e.g. Markdown fragments can be inserted into the contents section of a page markdown file via an include marker.

```
{#md "<file name>.md" #}
```

This allows for modular markdown and promotes reuse of markdown partials.

## Page Markdown File

A markdown file that will be transformed into an html file via a template

## Markdown Partials

A markdown file to be inserted into a Page Markdown file

Markdown partials are located in a separate directory, for example /md-library/. This directory should be located outside _/src/content/_ .

Partial markdown files have the extention **.md**. A markdown partial file does NOT have frontmatter metadata, only the markdown to be inserted into a page markdown file.

The markdown partials directory's default location is './src/md-library/'. The partials directory can be set via the libraryPath option.

## Installation

```js
$ npm install --save metalsmith-markdown-partials
```

## Usage

```js
var mdPartials = require('metalsmith-markdown-partials');

...
.use(mdPartials({
    libraryPath: './src/md-partials/',
    fileSuffix: '.md.njk',
  }))
...

```

## Options

**libraryPath**

The default libraryPath is './src/md-partials/'. This default assumes that all pages are located in './src/content/\*' so the markdown partials are located outside the metalsmith source directory.

```js
const mdPartials = require('metalsmith-markdown-partials');

metalsmith(__dirname)
  .use(mdPartials({
    libraryPath: './src/md-partials/'
  })
```

**fileSuffix**

The default fileSuffix is 'md', but depending on which templating language is used, the suffix will have two parts. For example for Nunjucks it will be 'md.njk'.

```js
const mdPartials = require('metalsmith-markdown-partials').use(
  mdPartials({
    fileSuffix: '.md.njk'
  })
);
```

## How it works

### index.md

```markdown
# This is an Example Page

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.

{#md "example_partial.md" #}

Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
```

### example_partial.md

```markdown
## Inserted Content

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.
```

### index.html

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

## Authors

- [werner@glinka.co](https://github.com/wernerglinka)

## License

Code released under [the ISC license](https://github.com/wernerglinka/metalsmith-markdown-partials/blob/main/LICENSE).

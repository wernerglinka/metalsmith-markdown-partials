# metalsmith-markdown-partials

This Metalsmith plugin enables the use of Markdown partials, e.g. Markdown fragments can be inserted into the contents section of a page markdown file via an include marker.

````
{{md "<file name>.md "}}
````

This allows for very modular markdown and promotes reuse of markdown partials.

## Page Markdown File
A markdown file that will be transformed into an html file via a template

## Markdown Partials
Markdown partials are located in a separate directory, for example /library/. This directory should be located in _/dev/content/_ and ignored by the Metalsmith process. This can be done using [metalsmith-ignore](https://github.com/segmentio/metalsmith-ignore)

````
var ignore = require('metalsmith-ignore');
...
// ignore partial markdown files in library
.use(ignore([
  'library/*'
  ]))
...
````

Partial markdown files have the extention **.md**. A markdown partial file does NOT have frontmatter metadata, only the markdown to be inserted into a page markdown file.

## Usage
````
var mdPartials = require('metalsmith-markdown-partials');

...
.use(mdPartials({"libraryPath": './dev/content/library/'}))
...

````
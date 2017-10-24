# metalsmith-markdown-partials

This Metalsmith plugin enables the use of Markdown partials, e.g. Markdown fragments can be inserted into the contents section of a page markdown file via an include marker.

````
{{md "<file name>.md" }}
````

This allows for modular markdown and promotes reuse of markdown partials.

## Page Markdown File
A markdown file that will be transformed into an html file via a template

## Markdown Partials
A markdown file to be inserted into a Page Markdown file

Markdown partials are located in a separate directory, for example /library/. This directory should be located in _/dev/content/_ and ignored by the Metalsmith process. This can be done using [metalsmith-ignore](https://github.com/segmentio/metalsmith-ignore).

Partial markdown files have the extention **.md**. A markdown partial file does NOT have frontmatter metadata, only the markdown to be inserted into a page markdown file.

The markdown partials directory's default location is './dev/content/library/'. The partials directory can be set via the libraryPath option.

### Example to ignore partial markdown files:
````
var ignore = require('metalsmith-ignore');
...
// ignore partial markdown files in library
.use(ignore([
  'library/*'
  ]))
...
````

## Install
````
$ npm install --save metalsmith-markdown-partials
````

## Usage
````
var mdPartials = require('metalsmith-markdown-partials');

...
.use(mdPartials({"libraryPath": './dev/content/library/'}))
...

````

### index.md

````
# This is an Example Page

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.

{{md "example_partial.md" }}

Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
````

### example_partial.md

````
## Inserted Content
Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.
````

### index.html
````
<h1>This is an Example Page</h1>

<p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p>

<h2>Inserted Content</h2>
<p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.</p>

<p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
````









/* eslint-disable */
const fs = require('fs');

/**
 * @typedef Options
 * @property {String} key
 */

/** @type {Options} */
const defaults = {
  libraryPath: './src/md-library/',
  fileSuffix: '.md'
};

/**
 * Normalize plugin options
 * @param {Options} [options]
 * @returns {Object}
 */
function normalizeOptions(options) {
  return Object.assign({}, defaults, options || {});
}

/**
 * getIncludes
 * Extract include markers from file contents
 *
 * @param  {[string]} str - the file contents in string form
 * @return {[array]}  markers - the start and end indexes for all include markers
 */

function getIncludes(fileData) {
  const str = fileData.contents.toString();
  const markers = [];
  let previousMarker, i;
  let temp = [];

  // find first include marker
  let newMarker = str.indexOf('{#md');

  if (newMarker > -1) {
    // get the number of partials in this file
    const count = (str.match(/{#md/g) || []).length;

    // get the marker boundaries for this file
    // a marker looks like this: {#md "<partial name>.md"#}
    for (i = 0; count > i; i++) {
      // get the marker pair
      temp.push(newMarker);
      previousMarker = newMarker;

      // find the closing brackets '#}'
      newMarker = str.indexOf('#}', previousMarker) + 2;
      temp.push(newMarker);

      // push marker pair into markers array
      markers.push(temp);

      temp = [];
      // find the next marker
      previousMarker = newMarker;
      newMarker = str.indexOf('{#md', previousMarker);
    }
  }
  return markers;
}

/**
 * resolveIncludes
 * Replace include markers with their respective files content
 *
 * @param  {[object]} fileData - the file being processed as an object
 * @param  {[array]} markers - the start and end indexes for all include markers
 * @param  {[object]} options  - plugin options. in this case the path to the directory that holds all the markdown includes
 * @return {[void]}
 */

function resolveIncludes(fileData, markers, options) {
  let markerString, filePath, replaceThis;
  const str = fileData.contents.toString();
  let data;

  for (i = 0; markers.length > i; i++) {
    // get the whole marker string
    markerString = str.substring(markers[i][0], markers[i][1]);

    // extract the markdown particle file path from the marker string
    // replace single quotes with double quotes... just in case
    filePath = markerString.replace(/'/g, '"');
    // get the path inside the marker between the quotes
    filePath = filePath.match(/"([^"]+)"/)[1];

    // get the file content
    const libPath = options.libraryPath;
    
    try {
      data = fs.readFileSync(libPath + filePath, 'utf8');
    } catch (e) {
      console.log('Error:', e.stack);
    }

    // replace the include marker with the actual include file content
    try {
      const contents = fileData.contents.toString();
      fileData.contents = Buffer.from(contents.replace(markerString, data));
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * A Metalsmith plugin to merge markdown partials into main markdown file
 *
 * A marker of the form {#md "<file name>.md" #} indicates where the partial
 * must be inserted and also provides the file name of the replacement markdown.
 *
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */

function markdownPartials(options) {
  options = normalizeOptions(options);

  return function (files, metalsmith, done) {
    setImmediate(done);

    Object.keys(files).forEach(function (file) {
      // checks if string 'file' ends with options.fileSuffix
      // when metalsmith-in-place or metalsmith-layouts are used
      // the suffix depends on what templating language is used
      // for example with Nunjucks it would be .md.njk
      if (file.endsWith(options.fileSuffix)) {
        // get the file data
        const fileData = files[file];

        // get include markers for this file
        const markers = getIncludes(fileData);

        // replace include markers with their respective replacement
        if (markers.length) {
          resolveIncludes(fileData, markers, options);
        }
      }
    });
  };
}

module.exports = markdownPartials;

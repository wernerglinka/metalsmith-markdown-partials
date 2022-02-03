/**
 * @typedef Options
 * @property {String} key
 */

/** @type {Options} */
const defaults = {
  libraryPath: './src/content/md-library/',
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
 * getMarkdownIncludes
 * Get include markdown markers and replacements
 *
 * @param  {[Object]} files - the metalsmith file object
 * @param {Options}  options
 * 
 * @return {[Array]}  Array with all markdown include objects
 */
function getMarkdownIncludes(files, options) {
    const markdownIncludes = [];

    // get the library name 
    const libraryPath = options.libraryPath.slice(0, -1).split("/");
    const libraryName = libraryPath[libraryPath.length - 1];

    Object.keys(files).forEach(function (file) {
      /*
       * checks if string 'file' ends with options.fileSuffix
       * when metalsmith-in-place or metalsmith-layouts are used
       * the suffix depends on what templating language is used
       * for example with Nunjucks it would be .md.njk
       *
       * Also check that file does NOT start with libraryName as 
       * the markdown partials library is also located in the content
       * folder
       */  
      if (file.endsWith(options.fileSuffix) && !file.startsWith(libraryName)) {
        const markerStart = "{#md";
        const markerEnd = "#}";
        const str = files[file].contents.toString();

        // check for markers present
        const count = str.match(/\{#md\s*".+?"\s*#\}/g).length;

        // get all markdown includes
        if (count) {
          for (let i = 0; count > i; i++) {
            const marker = str.match(/\{#md\s*"(.+?)"\s*#\}/g)[i];
            const markerFileName = marker.replaceAll(" ", "").replace(`${markerStart}"`, "").replace(`"${markerEnd}`, "");

            // get the replacement markdown string
            // by reconstructing the object key for the replacement markdown file
            // `${libraryName}/${markerFileName}`
            replacementString = files[`${libraryName}/${markerFileName}`].contents.toString();

            markdownIncludes.push({
              marker,
              markerReplacement: replacementString,
              file
            });
 
          }
        }
      }
    });

    // Remove markdown-partials from metalsmith build process
    Object.keys(files).forEach(function (file) {
      if (file.startsWith(libraryName)) {
        delete files[file];
      }
    });

    return markdownIncludes
}

/**
 * resolveMarkdownIncludes
 * Replace markers with their markdown replacement strings
 *
 * @param  {[Object]} files - the metalsmith file object
 * @param  {[Array]}  markdownIncludes with all markdown include objects
 * @return {[void]}
 */
function resolveMarkdownIncludes(files, markdownIncludes) {
  // replace all markers with their markdown replacements
  markdownIncludes.forEach(function(markdownInclude) {

    const fileData = files[markdownInclude.file];

    // replace the include marker with the actual include file content
    try {
      const contents = fileData.contents.toString();
      fileData.contents = Buffer.from(contents.replace(markdownInclude.marker, markdownInclude.markerReplacement));
    } catch (e) {
      console.error(e);
    }

  });
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

function initMarkdownPartials(options) {
  options = normalizeOptions(options);

  return function markdownPartials(files, metalsmith, done) {
    setImmediate(done);

    // get all markdown includes
    const markdownIncludes = getMarkdownIncludes(files, options);

    // replace include markers with their respective replacement
    if (markdownIncludes.length) {
      resolveMarkdownIncludes(files, markdownIncludes);
    }

  };
}

module.exports = initMarkdownPartials;

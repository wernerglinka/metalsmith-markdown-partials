/**
 * A Metalsmith plugin to merge markdown partials into main markdown files.
 * 
 * @module metalsmith-markdown-partials
 */

/**
 * @typedef {Object} Options
 * @property {String} libraryPath - Path to the markdown partials library (defaults to './src/content/md-library/')
 * @property {String} fileSuffix - File suffix for markdown files (defaults to '.md')
 */

// Define debug namespace at the top of the file
const debugNs = 'metalsmith-markdown-partials';

/** @type {Options} */
const defaults = {
  libraryPath: './src/content/md-library/',
  fileSuffix: '.md'
};

/**
 * Normalize plugin options by merging with defaults
 * @param {Options} [options] - User provided options
 * @returns {Options} Normalized options
 */
function normalizeOptions(options) {
  return Object.assign({}, defaults, options || {});
}

/**
 * Extract markdown partials from files and prepare them for insertion
 *
 * @param {Object} files - The metalsmith file object
 * @param {Options} options - Plugin options
 * @param {Function} debug - Debug function
 * @returns {Array} Array with all markdown include objects
 */
function getMarkdownIncludes(files, options, debug) {
  const markdownIncludes = [];

  // Extract the library name from the path
  const libraryPath = options.libraryPath.slice(0, -1).split("/");
  const libraryName = libraryPath[libraryPath.length - 1];
  
  debug('Processing markdown files with libraryName: %s', libraryName);

  // Regex for matching include markers
  const markerRegex = /\{#md\s*".+?"\s*#\}/g;
  const markerStart = "{#md";
  const markerEnd = "#}";

  // Set to track already processed partials to prevent duplicates
  const processedPartials = new Set();

  Object.keys(files).forEach(function(file) {
    /*
     * checks if string 'file' ends with options.fileSuffix
     * when metalsmith-in-place or metalsmith-layouts are used
     * the suffix depends on what templating language is used
     * for example with Nunjucks it would be .md.njk
     *
     * Also check that file does NOT start with libraryName as 
     * the markdown partials library is also located in the content folder
     */
    if (file.endsWith(options.fileSuffix) && !file.startsWith(libraryName)) {
      const str = files[file].contents.toString();

      // Check if markers are present
      const matches = str.match(markerRegex);
      if (!matches) return;
      
      debug('Found %d markdown partials in %s', matches.length, file);
      
      // Process each marker in the file
      matches.forEach((marker) => {
        // Extract the filename from the marker
        const markerFileName = marker.replaceAll(" ", "").replace(`${markerStart}"`, "").replace(`"${markerEnd}`, "");
        const partialKey = `${libraryName}/${markerFileName}`;
        
        // Check if partial file exists
        if (!files[partialKey]) {
          debug('Warning: Partial file not found: %s', partialKey);
          return;
        }
        
        // Skip if we've already processed this exact marker+file combination
        const combinedKey = `${file}:${marker}`;
        if (processedPartials.has(combinedKey)) return;
        
        processedPartials.add(combinedKey);
        
        // Get the replacement content
        const replacementString = files[partialKey].contents.toString();

        markdownIncludes.push({
          marker,
          markerReplacement: replacementString,
          file
        });
      });
    }
  });

  // Remove markdown-partials from metalsmith build process
  Object.keys(files).forEach(function(file) {
    if (file.startsWith(libraryName)) {
      delete files[file];
    }
  });

  debug('Processed %d markdown includes', markdownIncludes.length);
  return markdownIncludes;
}

/**
 * Replace markers with their markdown replacement strings
 *
 * @param {Object} files - The metalsmith file object
 * @param {Array} markdownIncludes - Array with all markdown include objects
 * @param {Function} debug - Debug function
 * @return {void}
 */
function resolveMarkdownIncludes(files, markdownIncludes, debug) {
  // replace all markers with their markdown replacements
  markdownIncludes.forEach(function(markdownInclude) {
    const fileData = files[markdownInclude.file];

    // replace the include marker with the actual include file content
    try {
      const contents = fileData.contents.toString();
      fileData.contents = Buffer.from(
        contents.replace(markdownInclude.marker, markdownInclude.markerReplacement)
      );
      debug('Replaced marker in %s', markdownInclude.file);
    } catch (e) {
      debug('Error replacing marker in %s: %s', markdownInclude.file, e.message);
      console.error(`Error replacing marker in ${markdownInclude.file}:`, e);
    }
  });
}

/**
 * A Metalsmith plugin to merge markdown partials into main markdown file
 *
 * A marker of the form {#md "<file name>.md" #} indicates where the partial
 * must be inserted and also provides the file name of the replacement markdown.
 *
 * @param {Options} [options] - Plugin options
 * @returns {import('metalsmith').Plugin} Metalsmith plugin function
 * @example
 * // In your metalsmith build:
 * .use(markdownPartials({
 *   libraryPath: './src/content/md-partials/',
 *   fileSuffix: '.md.njk'
 * }))
 */
function initMarkdownPartials(options) {
  options = normalizeOptions(options);

  return function markdownPartials(files, metalsmith, done) {
    // Use metalsmith's debug method if available
    const debug = metalsmith.debug ? metalsmith.debug(debugNs) : () => {};
    debug('Running with options: %o', options);
    
    try {
      // Get all markdown includes
      const markdownIncludes = getMarkdownIncludes(files, options, debug);

      // Replace include markers with their respective replacement
      if (markdownIncludes.length) {
        resolveMarkdownIncludes(files, markdownIncludes, debug);
      }
      
      setImmediate(done);
    } catch (err) {
      debug('Error processing markdown partials: %s', err.message);
      setImmediate(() => done(err));
    }
  };
}

// ESM export
export default initMarkdownPartials;

// CommonJS export compatibility
if (typeof module !== 'undefined') {
  module.exports = initMarkdownPartials;
}
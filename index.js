/* eslint-disable */
var fs = require('fs');

module.exports = plugin;

/**
 * Metalsmith plugin to merge markdown partials into main markdown file
 */

function plugin(options){
  options = options || {};

  return function(files, metalsmith, done){
    setImmediate(done);

    Object.keys(files).forEach(function(file){

      // exit if this file is not a markdown file
      var fileExtension = file.split('.').pop();
      if ( fileExtension !== 'md') return;

      // get the file data and convert to string
      var fileData = files[file];

      // get all include markers for this file
      var markers = getIncludes(fileData);

      // replace all include markers with their respective file content
      if (markers.length) {
        resolveIncludes(fileData, markers, options);
      }
    });
  };
}

/**
 * getIncludes
 * function to extract all include markers from the file contents
 * @param  {[string]} str - the file contents in string form
 * @return {[array]}  markers - the start and end indexes for all include markers
 */
function getIncludes(fileData) {
  var str = fileData.contents.toString();
  var markers = [];
  var previousMarker, i;
  var temp = [];
  // get any include marker
  var newMarker = str.indexOf('{{md');

  if ( newMarker > -1 ) {
    // get the number of partials in this file
    var count = (str.match(/{{md/g) || []).length;

    // get the marker boundaries for this file
    // a marker looks like this: {{md "<partial name>.md"}}
    for(i = 0; count > i; i++) {
      // get the marker pair
      temp.push(newMarker);
      previousMarker = newMarker;
      // find the closing brackets '}}'
      newMarker = str.indexOf('}}', previousMarker) + 2;
      temp.push(newMarker);
      // push marker pair into markers array
      markers.push(temp);
      temp = [];
      previousMarker = newMarker;
      newMarker = str.indexOf('{{md', previousMarker);
    }
  }
  return markers;
}


/**
 * resolveIncludes
 * function to replace all include markers with their respective files content
 * @param  {[object]} fileData - the file being processed as an object
 * @param  {[array]} markers - the start and end indexes for all include markers
 * @param  {[object]} options  - plugin options. in this case the path to the directory that holds all the markdown includes
 * @return {[void]}
 */
function resolveIncludes(fileData, markers, options) {
  var filePath, replaceThis;
  var str = fileData.contents.toString();

  for (i = 0; markers.length > i; i++) {
    // get the whole marker string
    filePath = str.substring(markers[i][0], markers[i][1]);
    // keep the include market string for later replace
    replaceThis = filePath;
    // replace single quotes with double quotes... just in case
    filePath = filePath.replace(/'/g, '"');
    // get the path inside the marker between the quotes
    filePath = filePath.match(/"([^"]+)"/)[1];

    // get the file content synchronously
    var libPath = options.libraryPath || './dev/content/library/'
    try {
        var data = fs.readFileSync(libPath + filePath, 'utf8');
    } catch(e) {
        console.log('Error:', e.stack);
    }

    // replace the include marker with the actual include file content
    try {
      var contents = fileData.contents.toString();
      fileData.contents = new Buffer(contents.replace(replaceThis, data));
    } catch (e) {
      console.error(e);
    }
  }
}
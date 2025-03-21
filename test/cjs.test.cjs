// Minimal CommonJS test file - just verifies the CJS module works
const assert = require('node:assert').strict;
const path = require('node:path');
const fs = require('node:fs');
const metalsmith = require('metalsmith');

// Import the plugin using the CommonJS format
const plugin = require('../lib/index.cjs');

describe('metalsmith-markdown-partials (CommonJS)', () => {
  // Verify the module loads correctly and exports a function
  it('should be properly importable as a CommonJS module', () => {
    assert.strictEqual(typeof plugin, 'function', 'Plugin should be a function when required with CommonJS');
    assert.strictEqual(typeof plugin(), 'function', 'Plugin should return a function when called');
  });
  
  // Add a basic functionality test to verify the plugin works
  it('should process markdown partials correctly', (done) => {
    const fixturesDir = path.join(__dirname, 'fixtures');
    
    const instance = plugin({
      libraryPath: path.join(fixturesDir, '/src/md-partials/'),
      fileSuffix: '.md',
    });

    // Create a fake metalsmith instance
    const metalsmithInstance = metalsmith(fixturesDir);
    
    // Load a test file
    const markdownContent = fs.readFileSync(path.join(fixturesDir, 'src/markdown.md'), 'utf8');
    const partialContent = fs.readFileSync(path.join(fixturesDir, 'src/md-partials/test-partial.md'), 'utf8');
    const expectedContent = fs.readFileSync(path.join(fixturesDir, 'expected/final-markdown.md'), 'utf8');
    
    // Setup files object
    const files = {
      'markdown.md': {
        contents: Buffer.from(markdownContent)
      },
      'md-partials/test-partial.md': {
        contents: Buffer.from(partialContent)
      }
    };
    
    // Run the plugin
    instance(files, metalsmithInstance, (err) => {
      assert.strictEqual(err, undefined, 'No error should occur');
      assert.strictEqual(
        files['markdown.md'].contents.toString().trim(),
        expectedContent.trim(),
        'Content should be properly processed'
      );
      done();
    });
  });
});
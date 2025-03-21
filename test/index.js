// ESM test file for Metalsmith plugins
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import metalsmith from 'metalsmith';

// Import the plugin directly from src for accurate coverage
import plugin from '../src/index.js';

// Get current directory and setup path utilities
const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = resolve.bind(resolve, __dirname, 'fixtures');

function file(_path) {
  return readFileSync(fixture(_path), 'utf8');
}

describe('metalsmith-markdown-partials (ESM)', () => {
  // Verify ESM module loading
  it('should be importable as an ES module', () => {
    assert.strictEqual(typeof plugin, 'function', 'Plugin should be a function when imported with ESM');
    assert.strictEqual(typeof plugin(), 'function', 'Plugin should return a function when called');
  });

  it('should replace marker with markdown partial', (done) => {
    metalsmith(fixture())
      .use(
        plugin({
          libraryPath: join(fixture(), `/src/md-partials/`),
          fileSuffix: '.md'
        })
      )
      .build((err) => {
        if (err) {
          return done(err);
        }
        assert.strictEqual(
          file('build/markdown.md').trim(),
          file('expected/final-markdown.md').trim(),
          'Content should match expected output'
        );
        done();
      });
  });

  it('should use metalsmith debug when available', (done) => {
    // Create a mock debug function that records calls
    const debugCalls = [];
    const mockMetalsmith = {
      debug:
        () =>
        (...args) => {
          debugCalls.push(args);
          return true;
        }
    };

    // Create test files
    const files = {
      'test.md': {
        contents: Buffer.from('Test content {#md "partial.md" #} more content')
      },
      'md-partials/partial.md': {
        contents: Buffer.from('Partial content')
      }
    };

    // Create and call the plugin
    const pluginInstance = plugin({
      libraryPath: './md-partials/',
      fileSuffix: '.md'
    });

    pluginInstance(files, mockMetalsmith, () => {
      assert(debugCalls.length > 0, 'Debug function should have been called');
      assert(debugCalls[0][0].includes('options'), 'Should include options message');
      done();
    });
  });

  it('should handle missing debug method gracefully', (done) => {
    // Create a metalsmith mock without debug method
    const mockMetalsmith = {};

    // Create test files
    const files = {
      'test.md': {
        contents: Buffer.from('Test content {#md "partial.md" #} more content')
      },
      'md-partials/partial.md': {
        contents: Buffer.from('Partial content')
      }
    };

    // Should not throw error when debug is missing
    const pluginInstance = plugin({
      libraryPath: './md-partials/',
      fileSuffix: '.md'
    });

    pluginInstance(files, mockMetalsmith, (err) => {
      assert.strictEqual(err, undefined, 'No error should occur when debug is missing');
      done();
    });
  });

  it('should handle files without markers correctly', (done) => {
    // Create a metalsmith mock
    const mockMetalsmith = {};

    // Create test files
    const files = {
      'test.md': {
        contents: Buffer.from('Test content without any markers')
      },
      'md-partials/partial.md': {
        contents: Buffer.from('Partial content')
      }
    };

    // Should not throw error when no markers are found
    const pluginInstance = plugin({
      libraryPath: './md-partials/',
      fileSuffix: '.md'
    });

    pluginInstance(files, mockMetalsmith, (err) => {
      assert.strictEqual(err, undefined, 'No error should occur when no markers are present');
      // Content should remain unchanged
      assert.strictEqual(
        files['test.md'].contents.toString(),
        'Test content without any markers',
        'Content should remain unchanged'
      );
      done();
    });
  });
});

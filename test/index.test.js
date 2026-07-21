import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import Metalsmith from 'metalsmith';

// Import the plugin directly from src for accurate coverage
import plugin from '../src/index.js';

// Get current directory and setup path utilities
const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = resolve.bind(resolve, __dirname, 'fixtures');

function file(_path) {
  return readFileSync(fixture(_path), 'utf8');
}

describe('metalsmith-markdown-partials', () => {
  // Verify ESM module loading
  it('should be importable as an ES module', () => {
    assert.strictEqual(typeof plugin, 'function', 'Plugin should be a function when imported with ESM');
    assert.strictEqual(typeof plugin(), 'function', 'Plugin should return a function when called');
  });

  it('should replace marker with markdown partial', (_t, done) => {
    Metalsmith(fixture())
      .use(
        plugin({
          libraryPath: join(fixture(), '/src/md-partials/'),
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

  it('should replace markers in in-memory files using a real Metalsmith instance', (_t, done) => {
    const files = {
      'test.md': {
        contents: Buffer.from('Test content {#md "partial.md" #} more content')
      },
      'md-partials/partial.md': {
        contents: Buffer.from('Partial content')
      }
    };

    const pluginInstance = plugin({
      libraryPath: './md-partials/',
      fileSuffix: '.md'
    });

    pluginInstance(files, Metalsmith(fixture()), (err) => {
      assert.strictEqual(err, undefined, 'No error should occur');
      assert.strictEqual(
        files['test.md'].contents.toString(),
        'Test content Partial content more content',
        'Marker should be replaced with the partial content'
      );
      done();
    });
  });

  it('should handle files without markers correctly', (_t, done) => {
    const files = {
      'test.md': {
        contents: Buffer.from('Test content without any markers')
      },
      'md-partials/partial.md': {
        contents: Buffer.from('Partial content')
      }
    };

    const pluginInstance = plugin({
      libraryPath: './md-partials/',
      fileSuffix: '.md'
    });

    pluginInstance(files, Metalsmith(fixture()), (err) => {
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

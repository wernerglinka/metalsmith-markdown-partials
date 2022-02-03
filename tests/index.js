/* global describe, it */

'use strict';

const chai = require('chai');
const metalsmith = require('metalsmith');
const mdPartials = require('../lib');
const fs = require('fs');
const path = require('path');
const expect = chai.expect;

const fixture = path.resolve.bind(path, __dirname, 'fixtures');

function file(_path) {
  return fs.readFileSync(fixture(_path), 'utf8');
}

describe('metalsmith-markdown-partials', () => {

  it('should replace marker with markdown partial', done => {

    metalsmith(fixture())
      .use(mdPartials({
          libraryPath: path.join(fixture(), `/src/md-partials/`),
          fileSuffix: '.md',
        }))
      .build( err => {
        if (err) {
          return done(err);
        }
        expect(file('build/markdown.md')).to.be.eql(file('expected/final-markdown.md'));
        
        done();
      });
  });
});

/* global describe, it */

'use strict';

import * as chai from 'chai';
import metalsmith from 'metalsmith';
import mdPartials from '../lib/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/* eslint-disable no-underscore-dangle */
const __dirname = dirname( fileURLToPath( import.meta.url ) );

const { expect } = chai;

const fixture = path.resolve.bind( path, __dirname, 'fixtures' );

function file( _path ) {
  return fs.readFileSync( fixture( _path ), 'utf8' );
}

describe( 'metalsmith-markdown-partials', () => {

  it( 'should replace marker with markdown partial', done => {

    metalsmith( fixture() )
      .use( mdPartials( {
        libraryPath: path.join( fixture(), `/src/md-partials/` ),
        fileSuffix: '.md',
      } ) )
      .build( err => {
        if ( err ) {
          return done( err );
        }
        expect( file( 'build/markdown.md' ) ).to.be.eql( file( 'expected/final-markdown.md' ) );

        done();
      } );
  } );
} );

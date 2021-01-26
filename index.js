#!/usr/bin/env node

const path    = require('path'),
      copy    = require('recursive-copy'),
      replace = require('replace'),
      cmd     = require('commander');

cmd
  .requiredOption('-n, --name <name>', 'name of the new proxy')
  .requiredOption('-f, --file <swagger>', 'path to the swagger file')
  .option('-h, --host <host>', 'host for the target')
  .option('-s, --scheme <scheme>', 'http or https [defaults to https]')
  .parse();


let file = cmd.opts().file; //process.argv[2];
let name = cmd.opts().name; //process.argv[3];

const pFile = require(path.resolve(file));

// set our intial vars
let paths = [];
let scheme = pFile.scheme || cmd.opts().scheme;
let host = pFile.host || cmd.opts().host;
let basepath = pFile.basePath;
let dir = path.dirname(process.argv[1]);

let length = 0;
let cmpPath = '';
// First we grab the paths and find the longest one
Object.keys(pFile.paths).forEach( p => {
  paths.push( p );
  pLength = p.split('/').length;
  
  if (pLength > length) {
    length = pLength;
    cmpPath = p;
  }
})

// Next we look at the longest one, split up the path elements and traverse all
// the paths looking for the common denominators
//let cpath = '';
let cpath = [];
cmpPath.split('/').slice(1).every( k => {
  let pathTest = Object.keys(pFile.paths).every( p => {
    //let matchPath = `${cpath}/${k}`;
    let matchPath =  '/' + cpath.concat(k).join('/');//`${cpath}/${k}`;
    if (p.startsWith(matchPath)) {
      return true;
    }
    else {
      console.log("didn't match on: %s", matchPath);
      return false;
    }
  });
  if (pathTest) {
    cpath = cpath.concat(k)
    //cpath = [cpath.split('/'),k].join();
    return true;
  }
  else {
    return false;
  }
})

console.log('the longest path: %s', cmpPath);
console.log('the longest common path: %s', cpath);

console.log('proposed target url: %s', `${scheme}://${host}/${cpath.join('/')}`)

let target = `${scheme}://${host}/${cpath.join('/')}`;

copy(`${dir}/proxy-template`,name)
  .then( x => {
    replace({
      regex: "@@BASEPATH@@",
      replacement: '/' + cpath.join('/'),
      paths: [ `${dir}/${name}/apiproxy/proxies/default.xml` ]
    });
    replace({
      regex: "@@TARGET@@",
      replacement: target,
      paths: [ `${dir}/${name}/apiproxy/targets/default.xml` ]
    })
  })
  .catch( e => {
    console.error('We done failed: ', e);
  })

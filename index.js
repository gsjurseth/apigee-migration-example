#!/usr/bin/env node

const path    = require('path'),
      copy    = require('recursive-copy'),
      replace = require('replace');


let file = process.argv[2];
let name = process.argv[3];

const pFile = require(path.resolve(file));

// set our intial vars
let paths = [];
let scheme = pFile.scheme || 'https';
let host = pFile.host;
let basepath = pFile.basePath;

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
console.log('The split stuff: %j', cmpPath.split('/'));
cmpPath.split('/').slice(1).every( k => {
  console.log('this is k: %s', k);
  let pathTest = Object.keys(pFile.paths).every( p => {
    //let matchPath = `${cpath}/${k}`;
    let matchPath =  '/' + cpath.concat(k).join('/');//`${cpath}/${k}`;
    console.log('checking if %s matches %s', matchPath, p);
    if (p.startsWith(matchPath)) {
      return true;
    }
    else {
      console.log("didn't match");
      return false;
    }
  });
  if (pathTest) {
    cpath = cpath.concat(k)
    //cpath = [cpath.split('/'),k].join();
    return true;
  }
  else {
    console.log("No, pathTest wasn't true: %j", pathTest);
    return false;
  }
})

console.log('the longest path: %s', cmpPath);
console.log('the longest common path: %s', cpath);

console.log('proposed target url: %s', `${scheme}://${host}/${cpath.join('/')}`)

let target = `${scheme}://${host}/${cpath.join('/')}`;

copy('./proxy-template',name)
  .then( x => {
    replace({
      regex: "@@BASEPATH@@",
      replacement: '/' + cpath.join('/'),
      paths: [ `./${name}/apiproxy/proxies/default.xml` ]
    });
    replace({
      regex: "@@TARGET@@",
      replacement: target,
      paths: [ `./${name}/apiproxy/targets/default.xml` ]
    })
  })
  .catch( e => {
    console.error('We done failed: ', e);
  })

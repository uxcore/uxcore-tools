'use strict';

var reactDocs = require('react-docgen');
var json2md = require('json2md');
var fs = require('fs');
var dir = require('node-dir');
var Promise = require('promise');
var assign = require('object-assign');

// for debug
// process.chdir('../mention');

var I18NREG = /@i18n\s\{([\w-]+)\}\s+(.+?)(?:(?=(?:@i18n\s\{[\w-]+\}))|$)/mg;
var LANG = [
  'zh-CN',
  'en-US',
];
var EMPTY_LANG = {};
LANG.forEach(function(lang){
  EMPTY_LANG[lang] = '';
});

function parseSourceFiles() {
  return new Promise(function(resolve, reject) {
    var parseResult = [];
    dir.readFiles('./src', {
      match: /\.jsx?$/
    }, function(err, content, next) {
      if (err) {
        reject(err);
      } else {
        try {
          parseResult.push(uxcoreParse(content));
        } catch(e) {
          // console.log(e);
        }
        next();
      }
    }, function(err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(parseResult)  
      }
    });
  });
}

function docWriter() {
  return new Promise(function(resolve, reject){
    parseSourceFiles()
      .then(function(data){
        var markdownJson = convertDocToMarkdownJson(data);

        Promise.all(LANG.map(function(lang){
          return new Promise(function(_resolve, _reject){
            fs.writeFile('./DOC.' + lang + '.md', json2md(markdownJson[lang]), function(err){
              if (err) {
                _reject(err);
              } else {
                _resolve('./DOC.' + lang + '.md');
              }
            });
          })
        })).then(function(res){
          resolve(res);
        }).catch(function(err){
          reject(err);
        });
      })
      .catch(function(err){
        reject(err);
      });
  });
}

function convertDocToMarkdownJson(jsonAry) {
  var initialJson = {};
  LANG.forEach(function(lang){
    initialJson[lang] = [];
  });
  var markdownJson = jsonAry.reduce(function(prev, cur) {
    var _o = {};
    // if the component has no displayName
    // ignore this component's doc
    if (!cur.displayName) {
      return prev;
    }

    // parse description
    var desc;
    if (cur.description) {
      desc = parseI18n(cur.description);
    } else {
      desc = assign({}, EMPTY_LANG);
    }
    // parse methods
    var methods = cur.methods.filter(function(d){
      return d.description || d.docblock;
    });
    methods = methods.map(function(method){
      if (method.docblock) {
        method.docblock = parseI18n(method.docblock);
      }
      return method;
    });
    // handle props
    var props = Object.keys(cur.props).map(function(p) {
      var propValue = cur.props[p];
      var _type;
      switch (propValue['type'].name) {
        case 'union':
          _type = 'union (' + propValue['type'].value.map(function(v){
            return v.name;
          }).join(', ') + ')';
          break;
        case 'enum':
          _type = 'enum (' + propValue['type'].value.map(function(v){
            return v.value;
          }).join(', ') + ')';
          break;
        case 'arrayOf':
          _type = 'arrayOf ' + propValue['type'].value.name;
          break;
        case 'instanceOf':
          _type = 'instanceOf ' + propValue['type'].value;
          break;
        default:
          _type = propValue['type'].name;
          break;
      }

      return [
        p,
        _type,
        String(propValue['required']),
        propValue['defaultValue'].value,
        parseI18n(propValue['description']),
      ];
    });

    LANG.forEach(function(lang){
      var tmp = [
        // name
        {
          h2: cur.displayName,
        },
        // description
        {
          p: desc[lang]
        }
      ];
      // api
      if (methods.length > 0) {
        tmp = tmp.concat([
          {
            h3: 'API',
          },
          {
            ul: methods.map(function(d){
              return d.name + '(' + d.params.map(function(p){
                return p.name
              }).join(' ,') + ')'  + ': ' +(d.docblock[lang] ? d.docblock[lang]: d.description);
            }),
          }
        ]);
      }
      tmp = tmp.concat([
        // props title
        {
          h3: 'PROPS',
        },
        // props table
        {
          table: {
            headers: [
              'Name',
              'Type',
              'Required',
              'DefaultValue',
              'Description',
            ],
            rows: props.map(function(p){
              var _p = p.slice(0);
              _p[4] = _p[4][lang];
              return _p;
            })
          },
        },
      ]);

      prev[lang] = prev[lang].concat(tmp);
    });
    return prev;

  }, initialJson);

  return markdownJson;
}

/**
 * parser for uxcore
 */
function uxcoreParse(src) {
  return reactDocs.parse(src, reactDocs.resolver.findExportedComponentnDefinitions);
  // return reactDocs.parse(src, reactDocs.resolver.findAllExportedComponentnDefinitions);
}

function parseI18n(str) {
  let res, ret = {};
  LANG.forEach(function(lang){
    ret[lang] = str;
  });
  while ((res = I18NREG.exec(str)) !== null) {
    ret[res[1]] = res[2];
  }
  return ret; 
}

module.exports = docWriter;
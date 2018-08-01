

const reactDocs = require('react-docgen');
const json2md = require('json2md');
const fs = require('fs');
const dir = require('node-dir');
const Promise = require('promise');
const assign = require('object-assign');

// for debug
// process.chdir('../mention');

const I18NREG = /@i18n\s\{([\w-]+)\}\s+(.+?)(?:(?=(?:@i18n\s\{[\w-]+\}))|$)/mg;
const LANG = [
  'zh-CN',
  'en-US',
];
const EMPTY_LANG = {};
LANG.forEach((lang) => {
  EMPTY_LANG[lang] = '';
});

function parseSourceFiles() {
  return new Promise(((resolve, reject) => {
    const parseResult = [];
    dir.readFiles('./src', {
      match: /\.jsx?$/,
    }, (err, content, next) => {
      if (err) {
        reject(err);
      } else {
        try {
          parseResult.push(uxcoreParse(content));
        } catch (e) {
          // console.log(e);
        }
        next();
      }
    }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(parseResult);
      }
    });
  }));
}

function getDirectory(path) {
  return new Promise(((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err || !stats.isDirectory()) {
        fs.mkdir(path, (_err) => {
          if (_err) {
            reject(_err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }));
}

function docWriter() {
  return new Promise(((resolve, reject) => {
    parseSourceFiles()
      .then((data) => {
        const markdownJson = convertDocToMarkdownJson(data);
        getDirectory('./doc')
          .then(() => {
            Promise.all(LANG.map(lang => new Promise(((_resolve, _reject) => {
              fs.writeFile(`./doc/${lang}.md`, json2md(markdownJson[lang]), (err) => {
                if (err) {
                  _reject(err);
                } else {
                  _resolve(`./doc/${lang}.md`);
                }
              });
            })))).then((res) => {
              resolve(res);
            }).catch((err) => {
              reject(err);
            });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  }));
}

function convertDocToMarkdownJson(jsonAry) {
  const initialJson = {};
  LANG.forEach((lang) => {
    initialJson[lang] = [];
  });
  const markdownJson = jsonAry.reduce((prev, cur) => {
    const _o = {};
    // if the component has no displayName
    // ignore this component's doc
    if (!cur.displayName) {
      return prev;
    }

    // parse description
    let desc;
    if (cur.description) {
      desc = parseI18n(cur.description);
    } else {
      desc = assign({}, EMPTY_LANG);
    }
    // parse methods
    let methods = cur.methods.filter(d => d.description || d.docblock);
    methods = methods.map((method) => {
      if (method.docblock) {
        method.docblock = parseI18n(method.docblock);
      }
      return method;
    });
    // handle props
    const props = Object.keys(cur.props).map((p) => {
      const propValue = cur.props[p];
      let _type;
      switch (propValue.type.name) {
        case 'union':
          _type = `union (${propValue.type.value.map(v => v.name).join(', ')})`;
          break;
        case 'enum':
          _type = `enum (${propValue.type.value.map(v => v.value).join(', ')})`;
          break;
        case 'arrayOf':
          _type = `arrayOf ${propValue.type.value.name}`;
          break;
        case 'instanceOf':
          _type = `instanceOf ${propValue.type.value}`;
          break;
        default:
          _type = propValue.type.name;
          break;
      }

      return [
        p,
        _type,
        String(propValue.required),
        propValue.defaultValue.value,
        parseI18n(propValue.description),
      ];
    });

    LANG.forEach((lang) => {
      let tmp = [
        // name
        {
          h2: cur.displayName,
        },
        // description
        {
          p: desc[lang],
        },
      ];
      // api
      if (methods.length > 0) {
        tmp = tmp.concat([
          {
            h3: 'API',
          },
          {
            ul: methods.map(d => `${d.name}(${d.params.map(p => p.name).join(' ,')})` + `: ${d.docblock[lang] ? d.docblock[lang] : d.description}`),
          },
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
            rows: props.map((p) => {
              const _p = p.slice(0);
              _p[4] = _p[4][lang];
              return _p;
            }),
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
  let res; const
    ret = {};
  LANG.forEach((lang) => {
    ret[lang] = str;
  });
  while ((res = I18NREG.exec(str)) !== null) {
    ret[res[1]] = res[2];
  }
  return ret;
}

module.exports = docWriter;

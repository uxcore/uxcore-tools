/*
* @Author: gbk
* @Date:   2016-03-28 16:42:29
* @Last Modified by:   gbk
* @Last Modified time: 2016-03-28 18:02:37
*/


const parseUrl = require('parseurl');
const { resolve } = require('path');
const send = require('send');

module.exports = (root, opts) => {
  opts = opts || {};
  opts.root = resolve(root);

  function onDirectory() {
    this.error(404);
  }

  return (req, res, next) => {
    let forwardError = false;
    send(req, parseUrl(req).pathname, opts)
      .on('directory', onDirectory)
      .on('file', () => {
        forwardError = true;
      })
      .on('error', (err) => {
        if (forwardError || !(err.statusCode < 500)) {
          next(err);
          return;
        }
        next();
      })
      .pipe(res);
  };
};

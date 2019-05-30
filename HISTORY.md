# history

## 0.3.16

* `CHANGED` update gulp-eslint dep version

## 0.3.9

* `CHANGED` add url-loader

## 0.3.8

* `CHANGED` `webpack.custom.js` can export a function.
* `CHANGED` rewrite logic with es5, low version node support is deprecated.

## 0.3.15

* `CHANGED` remove url loader limit 

## 0.3.5

* `FIXED` fix util & inherits circular dependency

## 0.3.3

* `FIXED` fix util circular dependency

## 0.3.1

* `CHANGED` prepared for upgrade16

## 0.3.0

* `CHANGED` update webpack to `3.x`

## 0.2.53

* `CHANGED` improve package string indent

## 0.2.52


* `CHANEGD` use semver to compare package version

## 0.2.51

* `CHANGED` import babel-plugin-import default

## 0.2.50

* `CHANGED` support less import & less transfer

## 0.2.49

* `CHANGED` add css files in test

## 0.2.48

* `CHANGED` support less function

## 0.2.47

* `FIXED` npm@5 will auto save dependencies when installing specific package 

## 0.2.46

* `CHANGED` remove IE8 browser test

## 0.2.45

* `CHANGED` set shell flag in spawn to be compatible with Windows

## 0.2.44

* `FIXED` task `update` fails to update dependencies to latest.

## 0.2.43

* `CHANGED` imporve task `dep` & `update`, reduce error happening

## 0.2.42

* `CHANGED` default test is `phantomjs`, `electron` is prefered.

## 0.2.41

* `CHANGED` use `electron` instead of `phantomjs`

## 0.2.40

* `CHANGED` autoprefix config 

## 0.2.39

* `FIXED` use sinon@1.x to support IE9/10 tests.

## 0.2.36

* `FIXED` fix react version to 0.14.x

## 0.2.35

* `FIXED` resolve.root config bug 

## 0.2.34

* `CHANGED` add support for `tinymce` & `rangy`

## 0.2.33

* `CHANGED` remove useless marker in `istanbul-instrumenter`

## 0.2.32

* `CHANGED` add enzyme support

## 0.2.31

* `CHANGED` remove webpack resolve.root config

## 0.2.30

* `NEW` support local webpack config.

## 0.2.26

* `CHANGED` support require svg
* `CHANGED` add es3ify-loader 

## 0.2.25

* `CHANGED` build will parse jsx file

## 0.2.24

* `CHANGED` change webpack resolve extension, add '.jsx .ts'

## 0.2.23

* `CHANGED` remove definePlugin in chrome & saucelabs task

## 0.2.22

* `CHANGED` add sourcemap and happypack in chrome task

## 0.2.21

* `CHANGED` stop screenshot in saucelabs task

## 0.2.20

* `FIX` remove unist-util-select

## 0.2.19

* `FIX` remove remark

## 0.2.18

* `NEW` add new task `update` & `tnpm-update`

## 0.2.17

* `CHANGED` detect sauce.json locally

## 0.2.12

* `CHANGED` add concurrency(3) in saucelab test config

## 0.2.11

* `CHANGED` only use definePlugin in saucelabs

## 0.2.10

* `FIX` fix env defination bug

## 0.2.9

* `NEW` add es3 plugin 

## 0.2.8

* `CHANGED` make env production
* `NEW` add gulp task browsers

## 0.2.7

* `CHANGED` open sauce connent in karma & set username/accesskey

## 0.2.6

* `CHANGED` not open sauce connent in karma

## 0.2.5

* `FIX` add missing dependency
* `CHANGED` open webpack cache

## 0.2.4

* `CHANGED` remove happyPack & process bar (performance ?)
* `CHANGED` add tnpm-dep task

## 0.2.3

* `NEW` add autoprefix less plugin

## 0.2.2

* `CHANGED` Do not parse uxcore modules in babel-loader
* `CHANGED` sourceMap use SourceMapDevToolPlugin
* `NEW` add happyPack
* `NEW` open default browser when server start
* `NEW` add process bar of webpack building
* `NEW` add portInUse detect
* `NEW` show true ip in console

## 0.2.1

* `FIX` fix publish bug
* `FIX` auto detect git branch & npm source

## 0.2

* `CHANGED` babel-loader use `cacheDirectory`
* `CHANGED` webpack sourceMap use `cheap-module-eval-source-map`
* `CHANGED` babel-loader will not parse uxcore
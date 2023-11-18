# @hitokoto/koa-jsonp

[![js-standard-style](https://img.shields.io/badge/Code%20Style-Standard-green.svg?style=flat-square)](https://github.com/feross/standard)
![Node.js CI](https://github.com/hitokoto-osc/koa-jsonp/workflows/Node.js%20CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/@hitokoto/koa-jsonp.svg?style=flat-square)](https://www.npmjs.com/package/@hitokoto/koa-jsonp)
[![NPM downloads](https://img.shields.io/npm/dm/@hitokoto/koa-jsonp.svg?style=flat-square)](https://www.npmjs.com/package/koa-jsonp)
[![GitHub Stars](https://img.shields.io/github/stars/hitokoto-osc/koa-jsonp.svg?style=flat-square)](https://github.com/hitokoto-osc/koa-jsonp)
[![License](https://img.shields.io/npm/l/@hitokoto/koa-jsonp.svg?style=flat-square)](https://www.npmjs.com/package/@hitokoto/koa-jsonp)

A [koajs](https://github.com/koajs/koa) streaming friendly JSONP middleware that supports GET/POST JSONP requests.

## Install
    $ npm install @hitokoto/koa-jsonp

## Example

```js
const db = require('nano')('http://localhost:5984/my_db')
const stringify = require('json-array-stream')
const jsonp = require('koa-jsonp')

app.use(jsonp())

app.use(mount('/users', async function (ctx) {
  ctx.type = 'json'
  ctx.body = db.view('koa_example', 'users')
    .pipe(JSONStream.parse('rows.*.value'))
    .pipe(stringify())
}))

app.use(mount('/dow', async function (ctx) {
  ctx.body = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}))

app.listen(8080)
```

yield

    GET  http://localhot:8080/users                       -> JSON
    POST http://localhot:8080/users                       -> JSON
    GET  http://localhot:8080/users?callback=onUserList   -> JSONP
    POST http://localhot:8080/users?callback=onUserList   -> JSONP

    GET  http://localhot:8080/dow                         -> JSON
    POST http://localhot:8080/dow                         -> JSON
    GET  http://localhot:8080/dow?callback=dowReady       -> JSONP
    POST http://localhot:8080/dow?callback=dowReady       -> JSONP

## API

```js
function jsonp (options)
```

Returns the koa middleware.

### Options
* **domain** - (`String`: defaults to `'.default.lan'`) the first level domain where your API will be consumed. Used in iframe mode ([???](#cors))
* **callbackName**: (`String`: defaults to `'callback'`) The name of the JSONP callback

### Use cases

* __JSONP__: `text/javascript`
* __JSONP + iFrame__: `text/html`

The middleware auto selects the right format based on the presence of callback (querystring) and the HTTP method.

![table](http://f.cl.ly/items/460B2P0h3m3c22000W1p/json-transport-0.1.0.png)

# JSONP CORS

*This is not required if your frontend and your API run in the same domain or if you set the `Access-Control-*` headers properly. In this case just use an `XMLHttpRequest` and don't use this middleware at all. Reference: [MDN](https://developer.mozilla.org/en/docs/HTTP/Access_control_CORS) - [HTML5Rocks](http://www.html5rocks.com/en/tutorials/cors/) - [SO](http://stackoverflow.com/questions/13146892/cors-access-control-allow-headers-wildcard-being-ignored)*

There is a way to read a JSONP response after sending a POST request (form) in the browser. The solution is to set an iframe as target of the form (could be hidden). The iframe will load your response page, in this case plain HTML with a script tag and will call your `callback` using `parent.callbackname(data)`.

This is an old snippet using `mootools` that creates a form, an iframe, and posts your request. Then dispose everything after executing your callback.
You can easily port it to jQuery.

```js
var __requestsMap__ = {}

function post(url, fields, callback) {
  var requestId = new Date().getTime()
  var inputs = []

  Object.keys(fields).forEach(function (fieldName) {
    inputs.push(new Element('input', {
      name: fieldName,
      value: data[fieldName]
    }))
  })

  if (url.match(/\?/)) {
    url += '&callback=__requestsMap__["' + requestId + '"]'
  } else {
    url += '?callback=__requestsMap__["' + requestId + '"]'
  }

  var form = new Element('form', {
    'enctype': enctype,
    'method': 'post',
    'action': url,
    'target': requestId,
    'style': 'display: none'
  }).adopt(inputs).inject(document.body)

  var iframe = new Element('iframe', {
    id: requestId,
    name: requestId,
    styles: { display: 'none' }
  }).inject(document.body)

  __requestsMap__[requestId] = function (response) {
    callback(null, response)
    // cleanup
    delete __requestsMap__[requestId]
    iframe.dispose().destroy()
    form.dispose().destroy()
  }

  form.submit()
}
```

# How to contribute

koa-jsonp follows (more or less) the [Felix's Node.js Style Guide](http://nodeguide.com/style.html), your contribution must be consistent with this style.

The test suite is written on top of [mochajs/mocha](http://mochajs.org) and it took hours of hard work. Please use the tests to check if your contribution is breaking some part of the library and add new tests for each new feature.

    ⚡ npm test

## License

_This software is released under the MIT license cited below_.

    Copyright (c) 2013 Kilian Ciuffolo, me@nailik.org. All Rights Reserved.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the 'Software'), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

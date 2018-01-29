'use strict'
const path = require('path')
module.exports = [
  // MiddleWares
  require('./src/middlewares/requestId')(),
  require('./src/middlewares/responseHandler')(),
  require('./src/middlewares/countRequest')(),

  // Basic Plugins
  require('koa-json')(),
  require('koa-jsonp')(),
  require('koa-bodyparser')({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb'
  }),
  require('kcors')({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    exposeHeaders: ['X-Request-Id', 'X-Api-Token'] // Need Api-token
  }),
  require('koa-favicon')(path.join(__dirname, './public/favicon.ico')),
  require('koa-compress')({
    filter: (contentType) => {
      return /text/i.test(contentType)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }),
  require('koa-json-error')(),
  require('./src/logger')(),

  // Dev Plugins
  require('koa-livereload')()
]

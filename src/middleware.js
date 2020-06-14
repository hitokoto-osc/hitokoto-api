// This module is designed to load all middlewares
const path = require('path')
const winston = require('winston')

function checkMiddlewaresFileValid (middlewares) {
  if (!Array.isArray(middlewares)) {
    winston.error('[init] common/dev koa plugins(middlewares) file is invalid, process existing.')
    process.exit(1)
  }
}

module.exports = {
  fetch (isDev) {
    let middlewares = require(path.join(__dirname, '../plugins'))
    checkMiddlewaresFileValid(middlewares) 
    if (isDev) {
      devMiddlewares = require(path.join(__dirname, '../plugins.dev'))
      checkMiddlewaresFileValid(devMiddlewares)
      middlewares = middlewares.concat(devMiddlewares)
    }
    return middlewares
  },
  register (app, isDev) {
    try {
      const middlewares = this.fetch(isDev)
      for (const middleware of middlewares) {
        if (middleware && typeof middleware === 'function') { // skip invalid middleware
          app.use(middleware)
        }
      }
      winston.verbose('[init] global koa plugins(middlewares) are loaded.')
    } catch (e) {
      winston.error(e)
      // mail.error(e)
      process.exit(1)
    }
  }
}

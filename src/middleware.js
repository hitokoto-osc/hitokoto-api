// This module is designed to load all middlewares
const path = require('path')
const winston = require('winston')
const colors = require('colors')

function checkMiddlewaresFileValid(middlewares) {
  if (!Array.isArray(middlewares)) {
    winston.error(
      '[middleware] common/dev koa plugins(middlewares) file is invalid, process existing.',
    )
    process.exit(1)
  }
}

module.exports = {
  fetch(isDev) {
    let middlewares = require(path.join(__dirname, '../adapter/plugins'))
    checkMiddlewaresFileValid(middlewares)
    if (isDev) {
      const devMiddlewares = require(path.join(
        __dirname,
        '../adapter/plugins.dev',
      ))
      checkMiddlewaresFileValid(devMiddlewares)
      middlewares = middlewares.concat(devMiddlewares)
    }
    return middlewares
  },
  register(app, isDev) {
    try {
      const middlewares = this.fetch(isDev)
      for (const middleware of middlewares) {
        if (
          middleware &&
          middleware[1] &&
          typeof middleware[1] === 'function'
        ) {
          // skip invalid middleware
          winston.verbose(
            '[middleware] global loaded: ' + colors.yellow(middleware[0]),
          )
          app.use(middleware[1])
        }
      }
      winston.verbose('[init] global koa plugins(middlewares) are loaded.')
    } catch (e) {
      winston.error(e)
      // mail.error(e)
      process.exit(1)
    }
  },
}

// This module is designed to load all middlewares
const path = require('path')
const { logger } = require('./logger')
const chalk = require('chalk')

function checkMiddlewaresFileValid(middlewares) {
  if (!Array.isArray(middlewares)) {
    logger.error(
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
          logger.verbose(
            '[middleware] global loaded: ' + chalk.yellow(middleware[0]),
          )
          app.use(middleware[1])
        }
      }
      logger.verbose('[init] global koa plugins(middlewares) are loaded.')
    } catch (e) {
      logger.error(e)
      // mail.error(e)
      process.exit(1)
    }
  },
}

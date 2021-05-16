const fs = require('fs')
const path = require('path')
const nconf = require('nconf')
const { logger } = require('./logger')

class Route {
  constructor() {
    const Controller = require('./controller')
    this.controller = new Controller()
    const Middleware = require('./middleware').fetch(!!nconf.get('dev'))
    this.middleware = {}
    Middleware.forEach((v) => {
      if (v && v[0] && v[1]) {
        this.middleware[v[0]] = v[1]
      }
    })
  }

  async routes() {
    try {
      const controller = await this.controller
      // RouteMap
      const Router = require('koa-router')
      if (!fs.existsSync(path.join(__dirname, '../', './adapter/routes.js'))) {
        logger.error("[route] can't find the route file, program exiting.")
        process.exitCode(1)
      }
      return require(path.join(__dirname, '../', './adapter/routes'))(
        new Router(),
        this.middleware,
        controller,
      )
    } catch (err) {
      logger.error(err)
      process.exit(1)
    }
  }
}
module.exports = Route

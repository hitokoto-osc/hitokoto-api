const fs = require('fs')
const path = require('path')
const nconf = require('nconf')
const winston = require('winston')

class Route {
  constructor() {
    const Controller = require('./controller')
    this.controller = new Controller()
    const Middlewares = require('./middleware').fetch(!!nconf.get('dev'))
    this.middlewares = {}
    Middlewares.map((v) => {
      if (v && v[0] && v[1]) {
        this.middlewares[v[0]] = v[1]
      }
    })
  }

  async routes() {
    try {
      const controller = await this.controller
      // RouteMap
      const Router = require('koa-router')
      if (!fs.existsSync(path.join(__dirname, '../', './adapter/routes.js'))) {
        winston.error("[route] can't find the route file, program exiting.")
        process.exitCode(1)
      }
      return require(path.join(__dirname, '../', './adapter/routes'))(
        new Router(),
        this.middlewares,
        controller,
      )
    } catch (err) {
      winston.error(err)
      process.exit(1)
    }
  }
}
module.exports = Route

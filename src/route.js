const fs = require('fs')
const path = require('path')
const winston = require('winston')

class route {
  constructor () {
    const Controller = require('./controller')
    this.controller = new Controller()
    this.middlewares = require('./middleware').fetch(false) // TODO: Support Dev Routes
    return this.routes()
  }

  async routes () {
    try {
      const controller = await this.controller
      // RouteMap
      const Router = require('koa-router')
      if (!fs.existsSync(path.join(__dirname, '../', './routes.js'))) {
        winston.error('[route] can\'t find the route file, program exiting.')
        process.exitCode(1)
      }
      return require(path.join(__dirname, '../', './routes'))(new Router(), this.middlewares, controller)
    } catch (err) {
      winston.error(err)
      process.exit(1)
    }
  }
}
module.exports = route

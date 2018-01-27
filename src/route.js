'use strict'
const path = require('path')
const winston = require('winston')

class route {
  constructor () {
    const Controller = require(path.join(__dirname, '../', './src/controller'))
    this.controller = new Controller()
    return this.routes()
  }

  async routes () {
    let routes
    await this.controller
      .then((controller) => {
        // Load RouteMap
        const Router = require('koa-router')
        const RouteMap = require(path.join(__dirname, '../', './routes'))(new Router(), controller)
        routes = RouteMap
      })
      .catch(err => {
        winston.error(err)
        process.exit(1)
      })
    return routes
  }
}
module.exports = route

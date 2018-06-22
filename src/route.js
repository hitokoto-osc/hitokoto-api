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
    try {
      let routes
      const controller = await this.controller
      // Load RouteMap
      const Router = require('koa-router')
      const RouteMap = require(path.join(__dirname, '../', './routes'))(new Router(), controller)
      routes = RouteMap
      return routes
    } catch (err) {
      winston.error(err)
      process.exit(1)
    }
  }
}
module.exports = route

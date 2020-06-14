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
      const controller = await this.controller
      // RouteMap
      const Router = require('koa-router')
      return require(path.join(__dirname, '../', './routes'))(new Router(), controller)
    } catch (err) {
      winston.error(err)
      process.exit(1)
    }
  }
}
module.exports = route

'use strict'
// Load Packages
const fs = require('fs')
const winston = require('winston')
const colors = require('colors/safe')
const path = require('path')

class controllers {
  constructor (controller) {
    if (controller) {
      // Register Controller
      return this.register(controller)
    } else {
      // Auto-load All Controllers
      return this.load()
    }
  }

  register (controller) {
    try {
      return require(path.join(__dirname, '../', './src/controllers', controller))
    } catch (e) {
      winston.error(colors.red(e))
      // mail.error(e)
      process.exit(1)
    }
  }

  async load () {
    try {
      // Load Controller
      let controllers = {}
      const dir = fs.readdirSync(path.join(__dirname, '../', './src/controllers'))
      await dir.map((item, index, input) => {
        controllers[item.substring(0, item.length - 3)] = module.parent.require(path.join(__dirname, '../', './src/controllers/' + item))
      })
      return controllers
    } catch (e) {
      winston.error(colors.red(e))
      process.exit(1)
    }
  }
}

module.exports = controllers

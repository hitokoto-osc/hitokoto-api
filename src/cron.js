'use strict'
// Import Packages
const winston = require('winston')
const path = require('path')
const fs = require('fs')
const colors = require('colors/safe')
const CronJob = require('cron').CronJob

// Load Cron
class cron {
  static async load () {
    try {
      // load crons
      let crons = await this.autoLoad()
      const cronMap = require(path.join(__dirname, '../crons.js'))(crons)
      if (cronMap === true) {
        // AutoLoad All Crons
        crons = await this.autoLoad(true)
        await crons.map((item, index, input) => {
          // Register CronJob
          const job = new CronJob(item[0], item[1], item[2], item[3], item[4])
          job.start()
        })
        winston.verbose('All Cron Jobs Load done.')
      } else {
        await cronMap.map((item, index, input) => {
          // Register CronJob
          const job = new CronJob(item[0], item[1], item[2], item[3], item[4])
          job.start()
        })
        winston.verbose('All Cron Jobs Load done.')
      }
    } catch (e) {
      winston.error(colors.red(e))
      process.exit(1)
    }
  }

  static async autoLoad (isArray) {
    try {
      // Load Crons
      let crons = {}
      const dir = fs.readdirSync(path.join(__dirname, '../', './src/crons'))
      if (isArray) {
        await dir.map((item, index, input) => {
          crons[index] = module.parent.require(path.join(__dirname, '../', './src/crons/' + item))
        })
      } else {
        await dir.map((item, index, input) => {
          crons[item.substring(0, item.length - 3)] = module.parent.require(path.join(__dirname, '../', './src/crons/' + item))
        })
      }
      return crons
    } catch (e) {
      winston.error(colors.red(e))
      process.exit(1)
    }
  }
}
module.exports = cron

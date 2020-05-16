'use strict'
// Import Packages
const winston = require('winston')
const path = require('path')
const fs = require('fs')
// const colors = require('colors/safe')
const CronJob = require('cron').CronJob

// 加载 Cron
class Cron {
  static async load () {
    try {
      // 加载 cron
      let crons = await this.autoLoad()
      const cronMap = require(path.join(__dirname, '../crons.js'))(crons)
      if (cronMap === true) {
        // 自动加载所有计划任务
        crons = await this.autoLoad(true)
        await crons.map((item, index, input) => {
          // 注册 CronJob
          const job = new CronJob(
            item[0],
            item[1],
            () => {
              // 检测是否启动自动重启任务
              Promise.resolve() // 异步按序执行
                .then(item[2]) // 已定义的 onComplete 函数
                .then(() => {
                  // 检测是否开启自动重启
                  if (item[5]) {
                    job.start()
                  }
                })
            },
            item[3],
            item[4])
          job.start()
        })
        winston.verbose('All Cron Jobs Load done.')
      } else {
        // 已经指定了 cronMap
        await cronMap.map((item, index, input) => {
          // Register CronJob
          const job = new CronJob(
            item[0],
            item[1],
            () => {
              // 检测是否启动自动重启任务
              Promise.resolve() // 异步按序执行
                .then(item[2]) // 已定义的 onComplete 函数
                .then(() => {
                  // 检测是否开启自动重启
                  if (item[5]) {
                    job.start()
                  }
                })
            },
            item[3],
            item[4])

          job.start()
        })
        process.send('loaded')
      }
    } catch (e) {
      process.send({
        key: 'error',
        data: e.stack
      })
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
          crons[index] = require(path.join(__dirname, '../', './src/crons/' + item))
        })
      } else {
        await dir.map((item, index, input) => {
          crons[item.substring(0, item.length - 3)] = require(path.join(__dirname, '../', './src/crons/' + item))
        })
      }
      return crons
    } catch (e) {
      process.send({
        key: 'error',
        data: e.stack
      })
      process.exit(1)
    }
  }
}

require('./prestart').load(null, true)
Cron.load()

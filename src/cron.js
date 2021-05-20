'use strict'
// Import Packages
const path = require('path')
const fs = require('fs')
// const chalk = require('chalk')
const CronJob = require('cron').CronJob

// 加载 Cron
class Cron {
  static async load() {
    try {
      // 加载 cron
      let crons = await this.autoLoad()
      const cronMap = require(path.join(__dirname, '../adapter/crons.js'))(
        crons,
      )
      if (cronMap === true) {
        // 自动加载所有计划任务
        crons = await this.autoLoad(true)
        await crons.forEach((item, index, input) => {
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
            item[4],
          )
          job.start()
        })
        const { logger } = require('./logger')
        logger.verbose('All Cron Jobs Load done.')
      } else {
        // 已经指定了 cronMap
        await cronMap.forEach((item, index, input) => {
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
            item[4],
          )

          job.start()
        })
        process.send({
          key: 'loaded',
          to: 'core',
          data: null,
          matchFrom: true,
        })
      }
    } catch (e) {
      process.send({
        key: 'error',
        to: 'core',
        data: e.stack,
        matchFrom: true,
      })
      process.exit(1)
    }
  }

  static async autoLoad(isArray) {
    try {
      // Load Crons
      const crons = {}
      const dir = fs.readdirSync(path.join(__dirname, '../', './src/crons'))
      if (isArray) {
        await dir.forEach((item, index, input) => {
          crons[index] = require(path.join(
            __dirname,
            '../',
            './src/crons/' + item,
          ))
        })
      } else {
        await dir.forEach((item, index, input) => {
          crons[item.substring(0, item.length - 3)] = require(path.join(
            __dirname,
            '../',
            './src/crons/' + item,
          ))
        })
      }
      return crons
    } catch (e) {
      process.send({
        key: 'error',
        to: 'core',
        data: e.stack,
        matchFrom: true,
      })
      process.exit(1)
    }
  }
}

const isDev = process.env?.dev === 'true'

require('./prestart')
  .loadAsync(null, true, isDev)
  .then(() => {
    Cron.load()
    const { logger } = require('./logger')
    logger.verbose('[cronJob] cronJob process is started.')
  })
process.on('uncaughtException', function (err) {
  const nconf = require('nconf')
  const { logger } = require('./logger')
  const { Sentry } = require('./tracing')
  logger.error(`uncaughtException: ${err.stack}`)
  if (nconf.get('telemetry:error') && !isDev) {
    Sentry.captureEvent(err)
  }
  process.exit(1)
})

process.on('exit', (code) => {
  if (code && code === 1000) {
    const { logger } = require('./logger')
    logger.info('[cronJob] receiving exiting signal, cronJob process exits.')
  }
})

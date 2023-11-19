'use strict'
// Import Packages
const { logger } = require('../logger')
const path = require('path')
const cache = require(path.join(__dirname, '../cache'))

function saveCount(ts, count) {
  cache.set('requests:count:' + ts, count, 60 * 60 * 25).catch((err) => {
    logger.error(err)
    saveCount(ts, count)
  })
}

function saveHostsCount(ts, count) {
  cache.set('requests:hosts:count:' + ts, count, 60 * 60 * 25).catch((err) => {
    logger.error(err)
    saveCount(ts, count)
  })
}
function autoSave(ts, requests) {
  saveCount(ts, requests.all)
  logger.debug(
    '[countRequestsCron] requests: ' + requests.all + ', saving to redis.',
  )
  saveHostsCount(ts, requests.hosts)
  logger.debug(
    '[countRequestsCron] host requests: %o\n, saving to redis.',
    requests.hosts,
  )
}
let requests = {
  all: 0,
  hosts: {},
}
process.on('message', (params) => {
  if (
    params &&
    params.key === 'updateRequests' &&
    params.to === 'countRequestsCron'
  ) {
    requests = params.data
  }
})
module.exports = [
  '* * * * * *', // Cron 配置
  () => {
    // 每次触发计划任务时执行...
    const ts = Date.now().toString().slice(0, 10)
    if (!requests.all) {
      Promise.all([cache.get('requests'), cache.get('requests:hosts')])
        .then((data) => {
          // Init
          requests = {}
          requests.all = data[0] || 0
          requests.hosts = data[1] || {}
          return requests
        })
        .then((requests) => {
          autoSave(ts, requests)
        })
    } else {
      autoSave(ts, requests)
    }
  },
  () => {
    // 该方法会在计划任务停止时执行
    logger.error('[countRequestsCron] job is stopped. Try to RESTART the job.')
  },
  false, // 是否立即启动计划任务
  'Asia/Shanghai', // 时区
  true, // 开启 自动重启？
]

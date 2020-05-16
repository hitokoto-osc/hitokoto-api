'use strict'
const winston = require('winston')
const {RunTask} = require('../task/updateSentencesTask')

module.exports = [
  '1 */30 * * * *', // Cron 配置
  () => {
    RunTask()
  },
  () => {
    // 该方法会在计划任务停止时执行
    winston.error('auto updating sentence job is stoppped. Try to RESTART it.')
  },
  true, // 是否立即启动计划任务
  'Asia/Shanghai', // 时区
  true // 开启 自动重启？
]

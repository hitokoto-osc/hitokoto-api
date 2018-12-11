'use strict'
// Import Packages
const winston = require('winston')
const path = require('path')
const axios = require('axios')
const nconf = require('nconf')
const pkg = require(path.join(__dirname, '../../', 'package.json'))

function exec (command) {
  return new Promise((resolve, reject) => {
    const exec = require('child_process').exec
    const workDir = path.join(__dirname, '../../')
    exec(command, {
      cwd: workDir
    }, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          stdout,
          stderr
        })
      }
    })
  })
}

function fetchCurrentVersion () {
  const version = pkg.version
  // 获取 Github Repos
  axios.get(
    // 请求 URL
    nconf.get('github_api') || 'https://api.github.com' + '/repos/kuertianshi/Hitokoto_Api/tags',
    // Axios 配置
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': encodeURIComponent('Hitokoto Update Service - Current Version: ' + version)
      },
      auth: {
        username: nconf.get('github_username') || 'a632079',
        password: nconf.get('github_password') || '01070ccf4eab548ad262a8f6256dc0bf66ae3166'
      },
      responseType: 'json'
    }
  )
    .then(data => {
      const currentVersion = Array.isArray(data) && data.length > 0 ? data[0].name : false
      if (currentVersion && currentVersion !== ('v' + version)) {
        // 版本不匹配， 进行更新程序
        Promise.resolve()
          .then(exec('git fetch'))
          .then(data => winston.verbose(data))
          .then(exec('git reset --hard origin/master'))
          .then(data => winston.verbose(data))
          .then(() => process.exit(0)) // 终结进程， PM2 自动重启后就是新版本
      }
    })
    .catch(err => {
      // 网络请求之类的， 遇到错误
      winston.error('尝试更新程序时遇到网络错误， 错误如下:')
      winston.error(err)
      winston.info('自动尝试重新获取..')
      fetchCurrentVersion()
    })
}

module.exports = [
  '0 0 */3 * * *', // Cron 配置
  () => {
    // 每次触发计划任务时执行...
    fetchCurrentVersion()
  },
  () => {
    // 该方法会在计划任务停止时执行
    winston.error('Requests statistics job is stopped. Try RESTART Job.')
  },
  false, // 是否立即启动计划任务
  'Asia/Shanghai', // 时区
  true // 开启 自动重启？
]

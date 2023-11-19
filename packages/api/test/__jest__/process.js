const path = require('path')
const { fork } = require('child_process')
let core
module.exports = class Process {
  static setup() {
    return new Promise((resolve, reject) => {
      try {
        core = fork(path.join(__dirname, '../../core.js'), {
          env: {
            NODE_ENV: 'test',
            url: 'https://v1.hitokoto.cn',
            api_name: 'sh-01-X23Hwoc',
            workers: 1, // only setup 1 worker
            'requests.hosts': "['127.0.0.1:8000']",
            'redis.host': '127.0.0.1',
            'redis.port': 6379,
          },
          stdio: ['ipc', 'ignore', process.stderr],
        })
        core.on('exit', (code, signal) => {
          if (code === 0 || signal === 'SIGTERM') {
            console.log(`[process] receiving code: ${code}, signal: ${signal}`)
            return
          }
          throw new Error(
            `[process] core process unexpected exited(code: ${code}, signal: ${signal})`,
          )
        })
        core.on('error', (err) => {
          throw err
        })
        core.on('message', (message) => {
          if (message?.key === 'started') {
            console.log('[process] core process started.')
            resolve()
          } else {
            // console.log(message)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  static teardown() {
    return new Promise((resolve, reject) => {
      try {
        if (!core) {
          throw new Error('core process is not exist')
        }
        core.kill('SIGINT')
        core.on('exit', (code, signal) => {
          if (signal === 'SIGTERM') {
            resolve()
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

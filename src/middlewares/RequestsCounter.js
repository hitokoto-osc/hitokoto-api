const { send } = require('../utils/worker/ipc')
const nconf = require('nconf')
const { logger } = require('../logger')
// TODO: waiting for Node.js LTS upon v16.x
// const { setTimeout } = require('timers/promises')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
class RequestsStatistic {
  all = 0
  hosts = {}
  constructor(all, hosts) {
    this.all = all || 0
    this.hosts = hosts || {}
  }

  checkHostValid(host) {
    return allowedHost.has(host)
  }

  addRequest(host) {
    this.all++
    if (host) {
      if (typeof this.hosts[host] === 'number') {
        this.hosts[host]++
      } else {
        this.hosts[host] = 1
      }
    }
  }

  clear() {
    this.hosts = {}
    this.all = 0
  }

  dump() {
    return {
      all: this.all,
      hosts: this.hosts,
    }
  }
}

const dumpInterval = parseInt(nconf.get('requests:dump_interval')) || 1000
const allowedHost = new Set(nconf.get('requests:hosts') || [])
const temporaryRequests = new RequestsStatistic()

nconf.set('emitRequestsLoopTerminalSignal', false)
async function emitRequests() {
  while (true) {
    // 用于解决堆栈溢出问题；提供一个终止信号用于终止
    if (nconf.get('emitRequestsLoopTerminalSignal')) break
    send(
      {
        key: 'update_requests_statistics',
        data: temporaryRequests.dump(),
      },
      'web.middlewares.requestCounter',
    )
    temporaryRequests.clear()
    await sleep(dumpInterval)
  }
}

process.on('message', (msg) => {
  const { key } = msg
  if (key === 'start_job') {
    emitRequests(dumpInterval).catch((err) => {
      throw err
    })
    logger.verbose(`[http.Worker] RequestsCounter IPC job started.`)
  }
})

function requestsCounter() {
  return async (ctx, next) => {
    await next()
    const host = String(ctx.request.host)
    temporaryRequests.addRequest(
      temporaryRequests.checkHostValid(host) ? host : undefined,
    )
  } // add counter
}

module.exports = requestsCounter

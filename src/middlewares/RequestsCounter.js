const { send } = require('../utils/worker/ipc')
const nconf = require('nconf')
const { setTimeout } = require('timers/promises')

class RequestsStatistic {
  constructor(all, hosts) {
    this.all = all || 0
    this.hosts = hosts
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

async function emitRequests() {
  send(
    {
      key: 'update_requests_statistics',
      data: temporaryRequests.dump(),
    },
    '[web.middlewares.requestCounter]',
  )
  await setTimeout(dumpInterval)
  emitRequests().catch((err) => {
    throw err
  })
}

process.on('message', (msg) => {
  const { key } = msg
  if (key === 'start_job') {
    setTimeout(dumpInterval)
      .then(emitRequests)
      .catch((err) => {
        throw err
      })
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

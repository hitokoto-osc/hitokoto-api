const { logger } = require('../logger')
const nconf = require('nconf')
const chalk = require('chalk')
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
  if (!process.send) {
    logger.error(
      `[web.middlewares.requestCounter] ${chalk.blue(
        process.send,
      )} is undefined. Maybe server is running by a inappropriate method?`,
    )
    throw new Error('process.send is undefined')
  }
  if (
    !process.send({
      key: 'update_requests_statistics',
      data: temporaryRequests.dump(),
    })
  ) {
    logger.error(
      `[web.middlewares.requestCounter] ${chalk.blue(
        process.send,
      )} return false. Maybe master process is killed?`,
    )
    throw new Error('process.send return false')
  }
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

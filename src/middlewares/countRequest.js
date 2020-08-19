const winston = require('winston')
const nconf = require('nconf')
const _ = require('lodash')
const cache = require('../cache')
const processList = require('../process').staticProcess().ProcessList

let cronJobProcess = null
const requests = {
  all: 0,
  hosts: {},
}
function countRequest() {
  return async (ctx, next) => {
    await next()
    if (
      !cronJobProcess ||
      (cronJobProcess && cronJobProcess.instance.exitCode >= 0)
    ) {
      cronJobProcess = _.find(processList, { name: 'cronJob' })
    }
    // Wait Request Done
    if (!nconf.get('middleware:requests')) {
      const fetchRequests = await Promise.all([
        cache.get('requests'),
        cache.get('requests:hosts'),
      ])
      requests.all = parseInt(fetchRequests[0]) || 0
      requests.hosts = fetchRequests[1] || {}
      nconf.set('middleware:requests', requests)
    }
    const host = String(ctx.request.host)
    requests.all++
    requests.hosts[host] =
      typeof requests.hosts[host] === 'undefined' ||
      requests.hosts[host] === null
        ? 0
        : parseInt(requests.hosts[host]) + 1

    // in memory store
    nconf.set('middleware:requests', requests)

    // notify cronJob
    cronJobProcess.instance.send({
      key: 'updateRequests',
      to: 'countRequestsCron',
      data: requests,
    })

    // save to redis
    Promise.all([
      cache.set('requests', requests.all),
      cache.set('requests:hosts', requests.hosts),
    ]).catch((err) => {
      winston.error(err)
    })
  }
}

module.exports = countRequest

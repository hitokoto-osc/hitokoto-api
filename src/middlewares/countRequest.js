'use strict'
function countRequest () {
  const path = require('path')
  const cache = require(path.join(__dirname, '../', 'cache'))
  const winston = require('winston')
  return async (ctx, next) => {
    await next()
    // Wait Request Done
    if (!global.requests) {
      const fetchRequests = await Promise.all([cache.get('requests'), cache.get('requests:hosts')])
      global.requests = {}
      global.requests.all = parseInt(fetchRequests[0]) || 0
      global.requests.hosts = fetchRequests[1] || {}
    }
    const host = String(ctx.request.host)
    global.requests.all++
    cache.set('requests', global.requests.all)
      .catch(err => {
        winston.error(err)
      })
    global.requests.hosts[host] = global.requests.hosts[host] === null ? 0 : parseInt(global.requests.hosts[host]) + 1
    if (global.requests.hosts['115.159.75.126:8000']) {
      delete global.requests.hosts['115.159.75.126:8000']
    }
    cache.set('requests:hosts', global.requests.hosts)
      .catch(err => {
        winston.error(err)
      })
  }
}

module.exports = countRequest

'use strict'

function countRequest () {
  const path = require('path')
  const cache = require(path.join(__dirname, '../', 'cache'))
  const winston = require('winston')
  return async (ctx, next) => {
    await next()
    // Wait Request Done

    const fetchRequests = await Promise.all([cache.get('requests'), cache.get('requests:hosts')])
    const all = fetchRequests[0] || 0
    const hosts = fetchRequests[1] || {}
    const host = String(ctx.request.host)
    cache.set('requests', parseInt(all) + 1)
      .catch(err => {
        winston.error(err)
      })
    if (!hosts[host]) {
      hosts[host] = 0
    }
    cache.set('requests:hosts', parseInt(hosts[host]) + 1)
      .catch(err => {
        winston.error(err)
      })
  }
}

module.exports = countRequest

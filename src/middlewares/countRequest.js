'use strict'

function countRequest () {
  const path = require('path')
  const cache = require(path.join(__dirname, '../', 'cache'))
  const winston = require('winston')
  return async (ctx, next) => {
    await next()
    // Wait Request Done
    await cache.get('requests')
      .then(requests => {
        requests = requests || '0'
        cache.set('requests', parseInt(requests) + 1)
          .catch(err => {
            winston.error(err)
          })
      })
      .catch(err => {
        winston.error(err)
      })
  }
}

module.exports = countRequest

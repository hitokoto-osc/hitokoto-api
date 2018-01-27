'use strict'

const uuidV4 = require('uuid/v4')
/**
 * Return middleware that gets an unique request id from a header or
 * generates a new id.
 *
 * @param {Object} [options={}] - Optional configuration.
 * @param {string} [options.header=X-Request-Id] - Request and response header name.
 * @param {string} [options.propertyName=reqId] - Context property name.
 * @param {function} [options.generator] - Id generator function.
 * @return {function} Koa middleware.
 */

function requestId (options = {}) {
  const {
    header = 'X-Request-Id',
    propertyName = 'reqId',
    generator = uuidV4
  } = options

  return (ctx, next) => {
    const reqId = ctx.request.get(header) || generator()
    ctx[propertyName] = reqId
    ctx.set(header, reqId)
    return next()
  }
}

module.exports = requestId

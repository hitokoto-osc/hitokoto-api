'use strict'

const { v4: uuidV4 } = require('uuid')
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

function requestId(options = {}) {
  const {
    header = 'X-Request-Id',
    propertyName = 'reqId',
    generator = uuidV4,
  } = options

  return async (ctx, next) => {
    const reqId = ctx.request.get(header) || generator()
    ctx[propertyName] = reqId
    ctx.set(header, reqId)
    await next()
  }
}

module.exports = requestId

const nconf = require('nconf')
const formatError = require('../utils').formatError
const { Sentry } = require('../tracing')
const { logger } = require('../logger')
const isTelemetryErrorEnabled = nconf.get('telemetry:error')
const isDev = nconf.get('dev')
const shouldThrow404 = (status, body) => {
  return !status || (status === 404 && body == null)
}

const IgnoredErrType = new Set(['RecoverRequestFailed'])

const isIgnoredErrType = (type) => {
  return IgnoredErrType.has(type)
}

const shouldEmitError = (err, status) => {
  return !err.expose && status >= 500 && !isIgnoredErrType
}

async function RecoverError(ctx, next) {
  try {
    await next()
    // future proof status
    shouldThrow404(ctx.status, ctx.body) && ctx.throw(404)
  } catch (e) {
    // Format and set body
    ctx.body = formatError(e) || {}
    if (!isDev) delete ctx.body.stack
    // Set status
    ctx.status = e.status || e.statusCode || 500
    // Emit the error if we really care
    if (shouldEmitError(e, ctx.status)) {
      // only emit in production env
      logger.error(e.stack)
      if (isTelemetryErrorEnabled && !isDev) {
        Sentry.withScope(function (scope) {
          scope.addEventProcessor(function (event) {
            return Sentry.Handlers.parseRequest(event, ctx.request)
          })
          Sentry.captureException(e)
        })
      }
    }
  }
}
function init() {
  return RecoverError
}
module.exports = init

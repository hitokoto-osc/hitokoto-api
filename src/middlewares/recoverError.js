const formatError = require('../utils').formatError
const { logger } = require('../logger')

const shouldThrow404 = (status, body) => {
  return !status || (status === 404 && body == null)
}

const shouldEmitError = (err, status) => {
  return !err.expose && status >= 500
}

async function RecoverError(ctx, next) {
  try {
    await next()
    // future proof status
    shouldThrow404(ctx.status, ctx.body) && ctx.throw(404)
  } catch (e) {
    // Format and set body
    ctx.body = formatError(e) || {}
    // Set status
    ctx.status = e.status || e.statusCode || 500
    // Emit the error if we really care
    shouldEmitError(e, ctx.status) && logger.error(e.stack)
  }
}
function init() {
  return RecoverError
}
module.exports = init

const mail = require('../mail')
const formatError = require('../utils').formatError
const nconf = require('nconf')
const winston = require('winston')

const shouldThrow404 = (status, body) => {
  return !status || (status === 404 && body == null)
}

const shouldEmitError = (err, status) => {
  return !err.expose && status >= 500
}

async function sendMail (ctx, next) {
  try {
    await next()
    // future proof status
    shouldThrow404(ctx.status, ctx.body) && ctx.throw(404)
  } catch (e) {
    // Format and set body
    ctx.body = formatError(e) || {}
    // Set status
    ctx.status = e.status || e.statusCode || 500
    // Mail Error
    if (nconf.get('admin') && ctx.status !== 404) {
      mail.error(e)
    }
    // Emit the error if we really care
    shouldEmitError(e, ctx.status) && winston.error(e)
  }
}
function init () {
  return sendMail
}
module.exports = init

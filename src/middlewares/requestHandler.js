const { Sentry } = require('../tracing')
// TODO: find a suitable way to replace this deprecated api
// eslint-disable-next-line node/no-deprecated-api
const domain = require('domain')
const requestHandler = (ctx, next) => {
  return new Promise((resolve, reject) => {
    const local = domain.create()
    local.add(ctx)
    local.on('error', (err) => {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    })
    local.run(async () => {
      Sentry.getCurrentHub().configureScope((scope) =>
        scope.addEventProcessor((event) =>
          Sentry.Handlers.parseRequest(event, ctx.request, { user: false }),
        ),
      )
      await next()
      resolve()
    })
  })
}
module.exports = requestHandler

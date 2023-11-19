const http = require('node:http')
const Koa = require('koa')
const chalk = require('chalk')
const nconf = require('nconf')
const app = new Koa()
// Load Route
async function registerRoutes(routes) {
  const { logger } = require('../logger')
  try {
    await routes
      .then((router) => {
        app.use(router.routes()).use(router.allowedMethods())
      })
      .catch((err) => {
        logger.error(chalk.red(err.stack))
        // mail.error(err)
        process.exit(1)
      })
    logger.verbose('[init] koa routes are loaded.')
  } catch (e) {
    logger.error(chalk.red(e.stack))
    // mail.error(e)
    process.exit(1)
  }
}
async function StartWebServer(isDev, port, hosts) {
  const { logger } = require('../logger')
  logger.verbose(hosts)
  await require('../middleware').register(app, isDev) // Register middlewares
  const Routes = require('../route')
  await registerRoutes(new Routes().routes())
  // TODO: optimize tracing entrypoint
  const { Sentry } = require('../tracing')
  const isTelemetryErrorEnabled = nconf.get('telemetry:error')
  if (isTelemetryErrorEnabled && !isDev) {
    app.on('error', (err, ctx) => {
      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event) {
          return Sentry.Handlers.parseRequest(event, ctx.request)
        })
        Sentry.captureException(err)
      })
    })
  }
  if (!hosts) {
    http.createServer(app.callback()).listen(port)
    return
  }
  hosts = typeof hosts === 'string' ? [hosts] : hosts
  for (const host of hosts) {
    logger.verbose(
      `[http.Worker.StartWebServer] start http server on ${host}:${port}`,
    )
    http.createServer(app.callback()).listen(port, host)
  }
}

function notifyMasterWorkerStarted() {
  const { send } = require('../utils/worker/ipc')
  send({
    key: 'started',
  })
}

// TODO: how to auto recover?

// PreStart
const { loadAsync } = require('../prestart')
const isDev = process.env?.dev === 'true'
const configFile = process.env?.config_file

process.on('uncaughtException', function (err, origin) {
  const nconf = require('nconf')
  const { logger } = require('../logger')
  const { Sentry, CaptureUncaughtException } = require('../tracing')
  logger.error(`${origin} occur uncaughtException: ${err.stack}`)
  if (nconf.get('telemetry:error') && !isDev) {
    CaptureUncaughtException(err)
    if (err.message !== 'read ECONNRESET') {
      Sentry.close().then(() => {
        process.exit(1)
      })
    }
  } else {
    if (err.message !== 'read ECONNRESET') {
      process.exit(1)
    }
  }
})

process.on('message', ({ key, data }) => {
  if (key === 'start_server') {
    loadAsync(configFile, true, isDev)
      .then(async () => {
        const { recoverAB } = require('../utils')
        await recoverAB()
        await StartWebServer(isDev, data.port, data.hosts)
      })
      .finally(() => {
        const { logger } = require('../logger')
        logger.verbose('[http.Worker] server worker is started successfully.')
        notifyMasterWorkerStarted()
      })
      .catch((err) => {
        const { logger } = require('../logger')
        logger.error(
          `[http.Worker] can't start worker. err detail: \n ${err.stack}`,
        )
        process.exit(1)
      })
  } else if (key === 'switchAB') {
    const { logger } = require('../logger')
    logger.verbose(
      `[http.Worker] pid: ${
        process.pid
      } received AB switch signal, switching to: ${chalk.blue(data)}`,
    )
    const AB = require('../extensions/sentencesABSwitcher')
    AB.setDatabase(data)
  }
})

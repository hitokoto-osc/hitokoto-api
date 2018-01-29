'use strict'

// Import Packages
const winston = require('winston')
const nconf = require('nconf')
const colors = require('colors/safe')
const Koa = require('koa') // Koa v2
// const mail = require('./src/mail')

// Register Server
const app = new Koa()

// PreStart
const preStart = require('./src/prestart')
preStart.load()

// Load CronJob
const cron = require('./src/cron')
cron.load()

// Register Middlewares (Plugins)
async function registerMiddlewares () {
  try {
    const middlewares = require('./plugins')
    await middlewares.map((middleware, index, input) => {
      app.use(middleware)
    })
    winston.verbose('All Plugins Load done.')
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}
registerMiddlewares()

// Load Route
async function registerRoutes (routes) {
  try {
    await routes.then(router => {
      app
        .use(router.routes())
        .use(router.allowedMethods())
    })
      .catch(err => {
        winston.error(err)
        // mail.error(err)
        process.exit(1)
      })
    winston.verbose('All Routes Load done.')
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}
const Routes = require('./src/route')
registerRoutes(new Routes())

// Start Server
async function start () {
  try {
    await app.listen(nconf.get('server:port'))
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}
start()
winston.info(colors.green('Server is started. Listening on Port:' + nconf.get('server:port')))

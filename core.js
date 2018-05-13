'use strict'

// Import Packages
const winston = require('winston')
const nconf = require('nconf')
const path = require('path')
const colors = require('colors/safe')
const Koa = require('koa') // Koa v2
// const mail = require('./src/mail')

// Read Command
let configFile
const paramsArray = process.argv.slice(2)
if (paramsArray.length > 1) {
  // exist params
  if (paramsArray[0] === '--config_file') {
    configFile = path.join('./', paramsArray[1])
  }
}

// PreStart
const preStart = require('./src/prestart')
preStart.load(configFile)

// Use blubird promise
global.Promise = require('bluebird')

// Register Server
const app = new Koa()

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

// Start Server
async function start () {
  try {
    await registerMiddlewares()
    const Routes = require('./src/route')
    await registerRoutes(new Routes())
    await app.listen(nconf.get('server:port'))
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}
start()
winston.info(colors.green('Server is started. Listening on Port:' + nconf.get('server:port')))

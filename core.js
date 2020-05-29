'use strict'

// Import Packages
const winston = require('winston')
const nconf = require('nconf')
const path = require('path')
const colors = require('colors/safe')
const Koa = require('koa') // Koa v2
// const pkg = require('./package.json')
// const mail = require('./src/mail')

// Read Command
const commander = require('./src/commander')
const program = commander.process()
// PreStart
const preStart = require('./src/prestart')
preStart.load(program.config_file || null)
if (program.dev) {
  winston.info('You are running at development mode.')
  winston.level = 'verbose'
}

// Use blubird promise
// global.Promise = require('bluebird')

// Register Server
const app = new Koa()

// Load CronJob
const childProcess = require('child_process')
function spawnCronProcess () {
  const child = childProcess.fork(path.join(__dirname, './src/cron.js'))
  if (program.dev) {
    child.send({
      key: 'debug',
      data: {}
    })
  }
  child.on('message', (message) => {
    if (message === 'loaded') {
      winston.verbose('Cron jobs are loaded.')
    } else if (message.key) {
      if (message.key === 'error') {
        console.log(colors.red(message.data))
        winston.error('error was thrown while loading cron jobs, process existing.')
      }
    }
  })
  // register master exit process
  let masterExitFlag = false
  process.on('exit', () => {
    // kill child process
    masterExitFlag = true
    child.send({
      key: 'exit',
      data: ''
    })
  })
  child.on('exit', () => {
    if (!masterExitFlag) {
      winston.warn('cron job process exited. try to respawn it.')
      spawnCronProcess()
    }
  })
}
spawnCronProcess()

// Register Middlewares (Plugins)
async function registerMiddlewares () {
  try {
    const middlewares = require('./plugins')
    await middlewares.map((middleware, index, input) => {
      app.use(middleware)
    })
    if (program.dev) {
      const devMiddlewares = require('./plugins.dev')
      await devMiddlewares.map((middleware, index, input) => {
        app.use(middleware)
      })
    }
    winston.verbose('Plugins are loaded.')
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}

// Run Task
// TODO: crate a task tree file
const {Task} = require('./src/task/updateSentencesTask')

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
    winston.verbose('Routes are loaded.')
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}

// Start Server
async function start () {
  try {
    await Task()
    await registerMiddlewares()
    const Routes = require('./src/route')
    await registerRoutes(new Routes())
    await app.listen(nconf.get('server:port'))
  } catch (e) {
    console.log(colors.red(e.stack))
    winston.error('error was thrown while starting, process exiting.')
    // mail.error(e)
    process.exit(1)
  }
}
start()
winston.info(colors.green('Hitokoto Sentences Api Service is started. Listening on Port:' + nconf.get('server:port')))

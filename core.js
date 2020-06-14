'use strict'

// Import Packages
const Koa = require('koa') // Koa v2
const winston = require('winston')
const nconf = require('nconf')
const path = require('path')
const colors = require('colors/safe')
// const pkg = require('./package.json')
// const mail = require('./src/mail')

// Read Command
const commander = require('./src/commander')
const program = commander.process()
// PreStart
const preStart = require('./src/prestart')
preStart.load(program.config_file || null)
if (program.dev) {
  winston.verbose('[debug] you are running at Development mode.')
  winston.level = 'verbose'
  nconf.set('dev', true)
}

// Use blubird promise
// global.Promise = require('bluebird')

// Register Server
const app = new Koa()

// Load CronJob
const childProcess = require('child_process')
function spawnCronProcess () {
  const child = childProcess.fork(path.join(__dirname, './src/cron.js'), {
    env: {
      dev: program.dev
    }
  })
  child.on('message', (message) => {
    if (message === 'loaded') {
      winston.verbose('[init] all cronJobs are loaded.')
    } else if (message.key) {
      if (message.key === 'error') {
        console.log(colors.red(message.data))
        winston.error('[init] error was thrown while loading cron jobs, process existing.')
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
      winston.warn('[cronJob] cron job process is exited. Try to respawn it.')
      spawnCronProcess()
    }
  })
}
spawnCronProcess()

// Register Middlewares (Plugins)
async function registerMiddlewares () {
  require('./src/middleware').register(app, program.dev)
}

// Run Task
// TODO: crate a task tree file
const { Task: updateSentencesTask } = require('./src/task/updateSentencesTask')

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
    winston.verbose('[init] koa routes are loaded.')
  } catch (e) {
    winston.error(e)
    // mail.error(e)
    process.exit(1)
  }
}

// Start Server
async function start () {
  try {
    await updateSentencesTask()
    await registerMiddlewares()
    const Routes = require('./src/route')
    await registerRoutes(new Routes())
    await app.listen(nconf.get('server:port'))
    winston.verbose('[init] All init processes are exceeded.')
    winston.info('[core] Web Server is started, listening on' + colors.yellow(' port') + ': ' + colors.blue(nconf.get('server:port')))
  } catch (e) {
    console.log(colors.red(e.stack))
    winston.error('[init] error was thrown while initializing, process exiting.')
    // mail.error(e)
    process.exit(1)
  }
}
start()

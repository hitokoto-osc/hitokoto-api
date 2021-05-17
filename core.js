'use strict'

// Import Packages
const Koa = require('koa') // Koa v2
const chalk = require('chalk')
const http = require('http')
const nconf = require('nconf')
// const os = require('os')
// const path = require('path')
// const pkg = require('./package.json')
// const mail = require('./src/mail')
const preStart = require('./src/prestart')
preStart.check() // Check Env
// Read Command
const commander = require('./src/commander')
const { opts } = commander.process()
// PreStart
preStart.load(opts.config_file || null)
const { logger } = require('./src/logger')
if (opts.dev) {
  logger.verbose('[debug] you are running at Development mode.')
  logger.level = 'verbose'
}

// Use blubird promise
// global.Promise = require('bluebird')

// Register Server
const app = new Koa()

// Load childProcesses
let childProcessList = []
async function registerProcesses() {
  const { processes: processesMap, receivers } = require('./adapter/processes')
  const processesToStart = []
  const isDev = opts.dev
  for (const process of processesMap) {
    if (
      (process.isDev && isDev) ||
      (process.isProd && !isDev) ||
      (!process.isDev && !process.isDev)
    ) {
      processesToStart.push(process)
    }
  }
  const { staticProcess, ProcessInteract } = require('./src/process')
  processesToStart.forEach((v) =>
    staticProcess().spawnProcess(v.path, v.name, v.messageListener),
  )
  childProcessList = staticProcess().ProcessList

  // load receivers
  const processInteract = new ProcessInteract(receivers)
  processInteract.register()
}

// Register Middlewares (Plugins)
async function registerMiddlewares() {
  require('./src/middleware').register(app, opts.dev)
}

// Run Task
// TODO: create a task tree file
const { Task: updateSentencesTask } = require('./src/task/updateSentencesTask')

// Load Route
async function registerRoutes(routes) {
  try {
    await routes
      .then((router) => {
        app.use(router.routes()).use(router.allowedMethods())
      })
      .catch((err) => {
        logger.error(chalk.red(err.stack))
        // mail.error(err)
        process.exit()
      })
    logger.verbose('[init] koa routes are loaded.')
  } catch (e) {
    logger.error(chalk.red(e.stack))
    // mail.error(e)
    process.exit()
  }
}

// handle the process exit event
function handleProcessExitSignal(signal) {
  logger.verbose(
    '[core] received signal: ' +
      chalk.yellow(signal) +
      ', start the exit produre.',
  )
  for (const child of childProcessList) {
    child.instance.kill('SIGTERM') // teng-koa exit signal code
  }
  logger.info('[core] Web server is shut down, Bye!')
  process.exit(0)
}
process.on('SIGINT', handleProcessExitSignal) // Ctrl + C
process.on('SIGTERM', handleProcessExitSignal)
process.on('exit', (code) => {
  // handle unexpected exit event
  if (code) {
    // ignore zero exit code
    logger.error(
      '[core] received exit code: ' + code + ', process will be destoryed.',
    )
    for (const child of childProcessList) {
      child.instance.kill('SIGTERM') // teng-koa exit signal code
    }
    logger.info('[core] Web server is shut down, Bye!')
  }
})

// TODO: start Workers involved Koa(experimental support)
// const { Worker } = require('worker_threads')
function startKoa(app) {
  /**
    let threadsNumber = nconf.get('worker') || 1
    if (threadsNumber === 0) {
      const cpusCount = os.cpus().length
      threadsNumber = cpusCount || 1
    }
  */
  http.createServer(app.callback()).listen(nconf.get('server:port'))
}
// Start Server
async function start() {
  try {
    await preStart.checkProgramUpdates()
    await updateSentencesTask()
    await registerProcesses()
    await registerMiddlewares()
    const Routes = require('./src/route')
    await registerRoutes(new Routes().routes())
    startKoa(app)
    logger.verbose('[init] All init steps are exceeded.')
    logger.info(
      '[core] Web Server is started, listening on' +
        chalk.yellow(' port') +
        ': ' +
        chalk.blue(nconf.get('server:port')),
    )
  } catch (e) {
    console.log(chalk.red(e.stack))
    logger.error('[init] error was thrown while initializing, process exiting.')
    // mail.error(e)
    process.exit()
  }
}

start().catch((e) => {
  throw e
})

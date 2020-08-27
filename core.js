'use strict'

// Import Packages
const Koa = require('koa') // Koa v2
const chalk = require('chalk')
const http = require('http')
const nconf = require('nconf')
// const os = require('os')
const winston = require('winston')
// const path = require('path')
// const pkg = require('./package.json')
// const mail = require('./src/mail')

// Read Command
const commander = require('./src/commander')
const program = commander.process()
// PreStart
const preStart = require('./src/prestart')
preStart.check()
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

// Load childProcesses
let childProcessList = []
async function registerProcesses() {
  const { processes: processesMap, receivers } = require('./adapter/processes')
  const processesToStart = []
  const isDev = program.dev
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

  // load receviers
  const processInteract = new ProcessInteract(receivers)
  processInteract.register()
}

// Register Middlewares (Plugins)
async function registerMiddlewares() {
  require('./src/middleware').register(app, program.dev)
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
        winston.error(chalk.red(err.stack))
        // mail.error(err)
        process.exit()
      })
    winston.verbose('[init] koa routes are loaded.')
  } catch (e) {
    winston.error(chalk.red(e.stack))
    // mail.error(e)
    process.exit()
  }
}

// handle the process exit event
function handleProcessExitSignal(signal) {
  winston.verbose(
    '[core] received signal: ' +
      chalk.yellow(signal) +
      ', start the exit produre.',
  )
  for (const child of childProcessList) {
    child.instance.kill('SIGTERM') // teng-koa exit signal code
  }
  winston.info('[core] Web server is shut down, Bye!')
  process.exit(0)
}
process.on('SIGINT', handleProcessExitSignal) // Ctrl + C
process.on('SIGTERM', handleProcessExitSignal)
process.on('exit', (code) => {
  // handle unexpected exit event
  if (code) {
    // ignore zero exit code
    winston.error(
      '[core] received exit code: ' + code + ', process will be destoryed.',
    )
    for (const child of childProcessList) {
      child.instance.kill('SIGTERM') // teng-koa exit signal code
    }
    winston.info('[core] Web server is shut down, Bye!')
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
    await updateSentencesTask()
    await registerProcesses()
    await registerMiddlewares()
    const Routes = require('./src/route')
    await registerRoutes(new Routes().routes())
    startKoa(app)
    winston.verbose('[init] All init steps are exceeded.')
    winston.info(
      '[core] Web Server is started, listening on' +
        chalk.yellow(' port') +
        ': ' +
        chalk.blue(nconf.get('server:port')),
    )
  } catch (e) {
    console.log(chalk.red(e.stack))
    winston.error(
      '[init] error was thrown while initializing, process exiting.',
    )
    // mail.error(e)
    process.exit()
  }
}
start()

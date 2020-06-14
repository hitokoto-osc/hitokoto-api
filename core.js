'use strict'

// Import Packages
const Koa = require('koa') // Koa v2
const winston = require('winston')
const nconf = require('nconf')
// const path = require('path')
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

// Load childProcesses
let childProcessList = []
async function registerProcesses () {
  const processesMap = require('./processes')
  const processesToStart = []
  const isDev = program.dev
  for (const process of processesMap) {
    if ((process.isDev && isDev) || (process.isProd && !isDev) || (!process.isDev && !process.isDev)) {
      processesToStart.push(process)
    }
  }
  const { staticProcess } = require('./src/process')
  processesToStart.forEach(v => staticProcess().spawnProcess(v.path, v.name, v.messageListener))
  childProcessList = staticProcess().ProcessList
}

// Register Middlewares (Plugins)
async function registerMiddlewares () {
  require('./src/middleware').register(app, program.dev)
}

// Run Task
// TODO: create a task tree file
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

// handle the process exit event
function handleProcessExitSignal (signal) {
  winston.verbose('[core] receive signal: ' + colors.yellow(signal) + ', starting the exit produre.')
  for (const child of childProcessList) {
    child.instance.kill('SIGTERM') // teng-koa exit signal code
  }
  winston.info('[core] Web server is shut down, Bye!')
  process.exit(0)
}
process.on('SIGINT', handleProcessExitSignal) // Ctrl + C
process.on('SIGTERM', handleProcessExitSignal)

process.on('exit', (code) => { // handle unexpected exit event
  if (code) { // ignore zero exit code
    winston.error('[core] receiving exit code: ' + code + ', process will be destoryed.')
    for (const child of childProcessList) {
      child.instance.kill('SIGTERM') // teng-koa exit signal code
    }
    winston.info('[core] Web server is shut down, Bye!')
  }
})

// Start Server
async function start () {
  try {
    await updateSentencesTask()
    await registerProcesses()
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

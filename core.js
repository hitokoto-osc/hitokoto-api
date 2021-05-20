'use strict'

// Import Packages
const chalk = require('chalk')
const preStart = require('./src/prestart')
preStart.check() // Check Env
// Read Command
const commander = require('./src/commander')
const { opts } = commander.process()
// PreStart
preStart.loadAsync(opts.config_file || null, false, opts.dev).then(() => {
  const { logger } = require('./src/logger')
  if (opts.dev) {
    logger.verbose(
      chalk.yellowBright('[debug] you are running at Development mode.'),
    )
  }
  // Load childProcesses
  let childProcessList = []
  async function registerProcesses() {
    const {
      processes: processesMap,
      receivers,
    } = require('./adapter/processes')
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

  // Run Task
  // TODO: create a task tree file
  const {
    Task: updateSentencesTask,
  } = require('./src/task/updateSentencesTask')

  // Web Server Master
  const { startWorkersPool, WorkersBridge } = require('./src/master')

  function notifyChildProcessesExit() {
    for (const child of childProcessList) {
      child.instance.kill('SIGTERM') // teng-koa exit signal code
    }
    for (const worker of WorkersBridge.workers.workersList) {
      worker.instance.kill('SIGTERM')
    }
  }
  // handle the process exit event
  function handleProcessExitSignal(signal) {
    logger.verbose(
      '[core] received signal: ' +
        chalk.yellow(signal) +
        ', start the exit produce.',
    )
    notifyChildProcessesExit()
    logger.info('[core] Web server is shut down, Bye!')
    process.exit(0)
  }
  process.on('uncaughtException', function (err) {
    logger.error(`uncaughtException: ${err.stack}`)
    const { Sentry } = require('./src/tracing')
    const nconf = require('nconf')
    if (nconf.get('telemetry:error') && !opts.dev) {
      Sentry.captureEvent(err)
    }
    notifyChildProcessesExit()
    process.exit(1)
  })
  process.on('SIGINT', handleProcessExitSignal) // Ctrl + C
  process.on('SIGTERM', handleProcessExitSignal)
  process.on('exit', (code) => {
    // handle unexpected exit event
    if (code) {
      // ignore zero exit code
      logger.error(
        '[core] received exit code: ' + code + ', process will be destroyed.',
      )
      notifyChildProcessesExit()
      logger.info('[core] Web server is shut down, Bye!')
    }
  })

  // Start Server
  async function start() {
    try {
      await preStart.checkProgramUpdates()
      await updateSentencesTask()
      await registerProcesses()
      await startWorkersPool()
      logger.verbose('[init] All init steps are exceeded.')
    } catch (e) {
      console.log(chalk.red(e.stack))
      logger.error(
        '[init] error was thrown while initializing, processes exiting.',
      )
      // mail.error(e)
      process.exit(1)
    }
  }

  start().catch((e) => {
    logger.error(e)
    throw e
  })
})

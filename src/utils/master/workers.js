const childProcess = require('child_process')
const path = require('path')
const { EventEmitter } = require('events')
const nconf = require('nconf')
const chalk = require('chalk')
const _ = require('lodash')
const { logger } = require('../../logger')

class Workers {
  /**
   * Create a workers instance
   * @param {number} workersNumber
   * @returns {boolean|any}
   */
  constructor(workersNumber) {
    this.workersNumbers = workersNumber
    this.configFile = nconf.get('config_file')
    this.isDev = !!nconf.get('dev')
    const _this = this
    this._workers = new Proxy([], {
      get(target, key, receiver) {
        return Reflect.get(target, key, receiver)
      },
      set(target, key, receiver) {
        if (key === 'length') {
          _this._notifyWorkersChanged(receiver)
        }
        return Reflect.set(target, key, receiver)
      },
    })
    this.messagesHandler = new MessagesHandler(this._workers, workersNumber)
  }

  setHandle(handle) {
    this.handle = handle
  }

  _notifyWorkersChanged(newLength) {
    this.messagesHandler._notifyWorkersChanged(newLength)
  }

  registerMessageHandler(key, messageHandler) {
    this.messagesHandler.register(key, messageHandler)
  }

  get workersList() {
    return this._workers
  }

  // Start workers
  async start() {
    logger.verbose(
      '[core.Master.Workers] %d workers will be spawned.',
      this.workersNumbers,
    )
    for (let i = 0; i < this.workersNumbers; i++) {
      this.spawnWorker()
    }
    logger.info('[core.Master.Workers] all workers are spawned.')
  }

  // Spawn Worker
  spawnWorker() {
    const worker = childProcess.fork(
      path.join(__dirname, '../../', './server.js'),
      {
        env: {
          dev: this.isDev,
          config_file: this.configFile,
        },
      },
    )
    logger.verbose(
      `[core.Master.Workers] worker process(${chalk.yellow(
        'pid',
      )}: ${chalk.blue(worker.pid)}) is spawned.`,
    )
    this._workers.push({ instance: worker, pid: worker.pid })
    // handle worker event
    worker.on('message', (message) => {
      message.from = worker.pid
      this.messageHandle(message)
    })
    worker.on('error', (err) => {
      logger.error(
        `[core.Master.Workers] worker process(${chalk.yellow(
          'pid',
        )}: ${chalk.blue(worker.pid)}) occur error: \n %s`,
        err.stack,
      )
      throw err
    })
    worker.on('exit', this.handleExitEvent(worker.pid))
    // send net socket handle
    worker.send('server_handle', this.handle)
  }

  // Handle worker messages
  messageHandle(message) {
    this.messagesHandler.handle(message)
  }

  // Handle Worker Exited event
  handleExitEvent(pid) {
    return (code, signal) => {
      if (code === null && !signal) {
        logger.error(
          `[web.Master] worker(${chalk.yellow('pid')}: ${chalk.blue(
            pid,
          )}) is exited accidentally. Try to respawn it.`,
        )
        _.remove(this._workers, { pid })
        this.spawnWorker()
      } else if (code > 0) {
        // errors might be thrown
        const errMsg = `[web.Master] worker process(${chalk.yellow(
          'pid',
        )}: ${chalk.blue(
          pid,
        )}) exited with code: ${code}, master process exits to ensure the stability.`
        logger.error(errMsg)
        throw new Error(errMsg)
      } else if (signal) {
        // exist ignore
        logger.info(
          `[web.Master] worker process(${chalk.yellow('pid')}: ${chalk.blue(
            pid,
          )})  is exited due to receiving a signal: ${chalk.blue(signal)}`,
        )
      } // ignore exit code: 0
    }
  }
}

class MessagesHandler {
  /**
   * Build messagesHandler instance
   * @param {array} workers
   * @param {number} configuredWorkersTarget
   * @returns {boolean|any}
   */
  constructor(workers, configuredWorkersTarget) {
    this.init = true
    this.workersTarget = configuredWorkersTarget
    this._workers = workers // Worker Instance List
    this.messageEvent = new EventEmitter()
    this._handleMessageEvent(this.messageEvent)

    this.currentStartIndicator = 0
  }

  register(key, handler) {
    this.messageEvent.on(key, handler)
  }

  // default handle
  _handleMessageEvent(event) {
    event.on('started', async ({ from }) => {
      // worker started event
      logger.verbose(
        `[core.Master] worker process(${chalk.yellow('pid')}: ${chalk.blue(
          from,
        )}) start handle requests.`,
      )
      this.currentStartIndicator++
      if (this.init && this.currentStartIndicator === this.workersTarget) {
        logger.verbose(
          `[core.Master] spawn ${this.workersTarget} workers successfully, and start to handle requests.`,
        )
      }
    })
    event.on('error', (err) => {
      throw err
    })
  }

  _notifyWorkersChanged(newLength) {
    if (!this.init) {
      logger.verbose(
        '[core.Master] workers number changed, current: %d. configured: %d',
        this.workersTarget,
        newLength,
      )
    }
  }

  finishedInit() {
    this.init = false
  }

  handle(message) {
    this.messageEvent.emit(message.key, message)
  }
}

module.exports = {
  MessagesHandler,
  Workers,
}

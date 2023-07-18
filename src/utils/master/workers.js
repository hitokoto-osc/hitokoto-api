// const childProcess = require('child_process')
const cluster = require('cluster')
const path = require('path')
const { EventEmitter } = require('events')
const nconf = require('nconf')
const chalk = require('chalk')
// const _ = require('lodash')
const { logger } = require('../../logger')

function setupCluster(params) {
  cluster.setupMaster(
    Object.assign(
      {
        exec: path.join(__dirname, '../../http', './worker.js'),
      },
      params,
    ),
  )
}

class Workers {
  workersNumbers = 0 // workers numbers
  listeningHosts = '0.0.0.0'
  listeningPort = 8000 // workers listening port
  configFile = ''
  isDev = false // debug mode
  _workers = {} // store workers instance
  env = {} // worker env
  /**
   * @typedef WorkersSettings
   * @type {object}
   * @property {number} workersNumber
   * @property {number} listeningPort
   */
  /**
   * Create a workers instance
   * @param {WorkersSettings} params
   * @returns {boolean|any}
   */
  constructor({ workersNumber, listeningPort, listeningHosts }) {
    this.workersNumbers = workersNumber
    this.listeningHosts = listeningHosts
    this.listeningPort = listeningPort
    this.configFile = nconf.get('config_file')
    this.isDev = !!nconf.get('dev')
    this.env = { dev: this.isDev, config_file: this.configFile }
    const _this = this
    this._workers = cluster.workers = new Proxy(
      {},
      {
        get(target, key, receiver) {
          return Reflect.get(target, key, receiver)
        },
        set(target, key, receiver) {
          _this._notifyWorkersChanged(receiver)
          return Reflect.set(target, key, receiver)
        },
      },
    ) // Hook cluster 的 worker 变量
    this.messagesHandler = new MessagesHandler(this._workers, workersNumber)
    setupCluster({})
  }

  _notifyWorkersChanged(newLength) {
    this.messagesHandler._notifyWorkersChanged(newLength)
  }

  registerMessageHandler(key, messageHandler) {
    this.messagesHandler.register(key, messageHandler)
  }

  get workers() {
    return this._workers
  }

  // Start workers
  async start() {
    logger.verbose(
      '[core.http.primary.Workers] %d workers will be spawned.',
      this.workersNumbers,
    )
    const hosts =
      typeof this.listeningHosts === 'string'
        ? [this.listeningHosts]
        : this.listeningHosts
    for (const host of hosts) {
      logger.info(
        `[core.http.primary.Workers] web server will listen on ${chalk.yellow(
          host + ':' + this.listeningPort,
        )}`,
      )
    }

    for (let i = 0; i < this.workersNumbers; i++) {
      this.spawnWorker()
    }
    logger.info('[core.http.primary.Workers] all workers are spawned.')
  }

  // Spawn Worker
  spawnWorker() {
    const worker = cluster.fork(this.env)
    logger.verbose(
      `[core.http.Primary.Workers] worker process(${chalk.yellow(
        'pid',
      )}: ${chalk.blue(worker.process.pid)}) is spawned.`,
    )
    // this._workers.push({ instance: worker, pid: worker.process.pid })
    // handle worker event
    worker.on('message', (message) => {
      message.from = worker.process.pid
      this.messageHandle(message)
    })
    worker.on('error', (err) => {
      logger.error(
        `[core.http.primary.Workers] worker process(${chalk.yellow(
          'pid',
        )}: ${chalk.blue(worker.process.pid)}) occur error: \n %s`,
        err.stack,
      )
      throw err
    })
    worker.on('exit', this.handleExitEvent(worker.process.pid))
    // start server
    worker.send({
      key: 'start_server',
      data: {
        port: this.listeningPort,
        hosts: this.listeningHosts,
      },
    })
  }

  notify(message) {
    for (const workerID in this._workers) {
      this._workers[workerID].send(message)
    }
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
          `[core.http.primary.Workers] worker(${chalk.yellow(
            'pid',
          )}: ${chalk.blue(pid)}) is exited accidentally. Try to respawn it.`,
        )
        //  _.remove(this._workers, { pid })
        this.spawnWorker() // 重新生成工作进程
      } else if (code > 0) {
        // errors might be thrown
        const errMsg = `[core.http.primary.Workers] worker process(${chalk.yellow(
          'pid',
        )}: ${chalk.blue(
          pid,
        )}) exited with code: ${code}, master process exits to ensure the stability.`
        logger.error(errMsg)
        throw new Error(errMsg) // 抛出 uncaughtException 来让进程可控得中断
      } else if (signal) {
        // exit ignore
        logger.info(
          `[core.http.primary.Workers] worker process(${chalk.yellow(
            'pid',
          )}: ${chalk.blue(
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
   * @param {object} workers - cluster workers object
   * @param {number} configuredWorkersTarget
   * @returns {boolean|any}
   */
  constructor(workers, configuredWorkersTarget) {
    this.init = true
    this.workersTarget = configuredWorkersTarget
    this._workers = workers // Worker Instance maps
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
        `[core.http.primary.Workers] worker process(${chalk.yellow(
          'pid',
        )}: ${chalk.blue(from)}) start handle requests.`,
      )
      this.currentStartIndicator++
      if (this.init && this.currentStartIndicator === this.workersTarget) {
        logger.info(
          `[core.http.primary.Workers] spawn ${this.workersTarget} workers successfully, and all workers start to handle requests.`,
        )
        if (process.send) {
          // test only
          process.send({
            key: 'started',
          })
        }
      }
    })
    event.on('error', (err) => {
      throw err
    })
  }

  _notifyWorkersChanged(newLength) {
    if (!this.init) {
      logger.verbose(
        '[core.http.primary.Workers] workers number changed, current: %d. configured: %d',
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

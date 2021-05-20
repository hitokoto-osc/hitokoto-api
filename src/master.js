const net = require('net')
const os = require('os')
const { EventEmitter } = require('events')
const nconf = require('nconf')
const chalk = require('chalk')
const { logger } = require('./logger')
const { Workers } = require('./utils/master/workers')
module.exports = exports = {}

function AsyncListen(server) {
  return new Promise((resolve, reject) => {
    server.listen(nconf.get('server:port'), function () {
      logger.info(
        `[core] net socket is occupied, listening on ${chalk.yellow(
          ' port',
        )}: ${chalk.blue(nconf.get('server:port'))}.`,
      )
      resolve(server)
    })
  })
}

exports.getServerHandle = async function () {
  const server = net.createServer()
  await AsyncListen(server)
  return server
}

const workersNumber = nconf.get('workers') || os.cpus().length
const workers = new Workers(workersNumber)
const { requestsCounter } = require('./utils/master/requestsCounterMerge')
exports.startWorkersPool = async () => {
  const handle = await exports.getServerHandle()
  workers.setHandle(handle)
  // register custom handler
  workers.registerMessageHandler(
    'update_requests_statistics',
    requestsCounter.getWorkersRequestsRecordHandler(),
  )
  workers.registerMessageHandler('started', (message) => {
    logger.verbose('[core.Master] notify workers to start jobs')
    workers.notify({
      key: 'start_job',
    })
  })
  await workers.start()
  return workers
}

const bridgeEvent = new EventEmitter()
exports.WorkersBridge = class WorkersBridge {
  static get bridge() {
    return bridgeEvent
  }

  static get workers() {
    return workers
  }

  static registerListener(key, handler) {
    workers.registerMessageHandler(key, handler)
  }
}

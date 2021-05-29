const { logger } = require('../logger')
const nconf = require('nconf')
const chalk = require('chalk')

const reconnect = (err) => {
  const targetError = 'READONLY'
  if (err.message.includes(targetError)) {
    // Only reconnect when the error contains "READONLY"
    return true
  }
}

const ConnectionConfig = {
  host: nconf.get('redis:host') || '127.0.0.1',
  port: nconf.get('redis:port') || 6379,
  db: nconf.get('redis:database') || 0,
  family: nconf.get('redis:family') || 4,
  reconnectOnError: reconnect,
}

const handleError = function (err) {
  if (typeof this.connectionFailedAttempt === 'undefined') {
    this.connectionFailedAttempt = 0
  }
  logger.error(chalk.red(err.stack))
  if (this.connectionFailedAttempt >= 3) {
    logger.error(
      '[cache] attempt to connect to redis ' +
        this.connectionFailedAttempt +
        ' times, but all failed, process exiting.',
    )
    process.exit(1)
  }
  logger.error('[cache] failed to connect to redis, we will attempt again...')
  this.connectionFailedAttempt++
  nconf.set('connectionFailedAttempt', this.connectionFailedAttempt)
  this.connect()
}

module.exports = exports = { handleError, ConnectionConfig, reconnect }

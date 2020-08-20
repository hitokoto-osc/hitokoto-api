const winston = require('winston')
const nconf = require('nconf')
const chalk = require('chalk')

let connectionFailedAttemp = nconf.get('connectionFailedAttemp')

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

const handleError = (err) => {
  winston.error(chalk.red(err.stack))
  if (connectionFailedAttemp >= 3) {
    winston.error(
      '[cache] attemp to connect to redis ' +
        connectionFailedAttemp +
        ' times, but all failed, process exiting.',
    )
    process.exit(1)
  }
  winston.error('[cache] failed to connect to redis, we will attemp again...')
  connectionFailedAttemp++
  nconf.set('connectionFailedAttemp', connectionFailedAttemp)
  this.connect()
}

module.exports = exports = { handleError, ConnectionConfig, reconnect }

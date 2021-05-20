const chalk = require('chalk')
const { logger } = require('../../logger')

function send(message, tag) {
  if (!process.send) {
    logger.error(
      `[${tag}] ${chalk.blue(
        'process.send',
      )} is undefined. Maybe server is running by a inappropriate method?`,
    )
    throw new Error('process.send is undefined')
  }
  if (!process.send(message)) {
    logger.error(
      `[${tag}] ${chalk.blue(
        'process.send',
      )} return false. Maybe master process is killed?`,
    )
    throw new Error('process.send return false')
  }
}

module.exports = {
  send,
}

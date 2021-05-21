const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')
const nconf = require('nconf')
const winston = require('winston')

function getLogFilePath() {
  const logFile =
    nconf.get('log_path') ||
    path.join(__dirname, '../', './data/logs/', pkg.name + '_error.log')

  // createDir while running at docker
  const dirPath = path.join(logFile, '../')
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
  fs.existsSync(logFile) || fs.writeFileSync(logFile, '')
  return logFile
}

function getConsoleFormatter() {
  const formatList = [
    winston.format.colorize({
      all: !!nconf.get('log-colorize'),
    }),
    winston.format.timestamp({
      format: () => {
        const date = new Date()
        return nconf.get('json_logging')
          ? date.toJSON()
          : date.toISOString() + ' [' + global.process.pid + ']'
      },
    }),
    winston.format.splat(),
  ]
  if (nconf.get('json_logging')) {
    formatList.push(
      winston.format.prettyPrint(),
      winston.format.json(),
      winston.format.printf((info) => {
        if (info.message.constructor === Object) {
          info.message = JSON.stringify(info.message, null, 4)
        }
        return `${info.level}: ${info.message}`
      }),
    )
  } else {
    formatList.push(
      winston.format.printf((info) => {
        return `${info.timestamp} - ${info.level}: ${info.message}`
      }),
    )
  }
  return winston.format.combine(...formatList)
}

exports.logger = winston.createLogger({
  level: 'verbose',
}) // just is used to support auto-complete

function getCurrentLevel() {
  return !nconf.get('dev') ?? !(process.env && process.env.dev === 'true')
    ? 'info'
    : 'verbose'
}

// SetupLogger is intended to init logger
exports.SetupLogger = async () => {
  const logFile = getLogFilePath()
  exports.logger = winston.createLogger({
    level: getCurrentLevel(),
  })
  exports.logger.remove(winston.transports.Console)
  exports.logger.remove(winston.transports.File)
  exports.logger.add(
    new winston.transports.Console({
      format: getConsoleFormatter(),
      stderrLevels: ['error'],
    }),
  )
  exports.logger.add(
    new winston.transports.File({
      filename: logFile,
      level: 'error', // strict log level
      handleExceptions: true,
      maxsize: 5242880,
      maxFiles: 10,
    }),
  )
}

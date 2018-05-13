'use strict'
const winston = require('winston')
const config = require('../config')
const nconf = require('nconf')
const pkg = require('../package.json')
const path = require('path')
const fs = require('fs')
const dirname = path.join(__dirname, '../')

function setupWinston () {
  const logFile = config.log_path || path.join(__dirname, '../', './logs/', pkg.name + '.log')
  fs.existsSync(logFile) || fs.writeFileSync(logFile, '')
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.File, {
    filename: logFile,
    level: config.log_level || (global.env === 'production' ? 'info' : 'verbose'),
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles: 10
  })
  winston.add(winston.transports.Console, {
    colorize: nconf.get('log-colorize') !== 'false',
    timestamp: function () {
      var date = new Date()
      return config.json_logging ? date.toJSON()
        : date.toISOString() + ' [' + global.process.pid + ']'
    },
    level: config.log_level || (global.env === 'production' ? 'info' : 'verbose'),
    json: !!config.json_logging,
    stringify: !!config.json_logging
  })
}

function loadConfig (configFile) {
  winston.verbose('* using configuration stored in: %s', configFile)

  nconf.file({
    file: configFile
  })

  nconf.defaults({
    base_dir: dirname,
    version: pkg.version
  })

  if (!nconf.get('isCluster')) {
    nconf.set('isPrimary', 'true')
    nconf.set('isCluster', 'false')
  }
}

function printCopyright () {
  const colors = require('colors/safe')
  const date = new Date()
  console.log(colors.bgBlue(colors.black(' ' + pkg.name + ' v' + pkg.version + ' © ' + date.getFullYear() + ' All Rights Reserved. ')) + '   ' + colors.bgRed(colors.black(' Powered by teng-koa ')))
  console.log('')
  console.log(colors.bgCyan(colors.black(' 我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。 ')))
}

module.exports = {
  load: (config_file) => {
    if (!config_file) {
      config_file = path.join(__dirname, '../', 'config.json')
    }
    setupWinston()
    loadConfig(config_file)
    printCopyright()
  }
}

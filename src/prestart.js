'use strict'
const winston = require('winston')
const nconf = require('nconf')
const pkg = require('../package.json')
const path = require('path')
const fs = require('fs')
const dirname = path.join(__dirname, '../')

async function setupWinston () {
  const logFile = nconf.get('log_path') || path.join(__dirname, '../', './data/logs/', pkg.name + '.log')
  // createDir while running at docker
  const dirPath = path.join(logFile, '../')
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  fs.existsSync(logFile) || fs.writeFileSync(logFile, '')
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.File, {
    filename: logFile,
    level: nconf.get('log_level') || (global.env === 'production' ? 'info' : 'verbose'),
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles: 10
  })
  winston.add(winston.transports.Console, {
    colorize: nconf.get('log-colorize') !== 'false',
    timestamp: function () {
      var date = new Date()
      return nconf.get('json_logging') ? date.toJSON()
        : date.toISOString() + ' [' + global.process.pid + ']'
    },
    level: nconf.get('log_level') || (global.env === 'production' ? 'info' : 'verbose'),
    json: !!nconf.get('json_logging'),
    stringify: !!nconf.get('json_logging')
  })
}

function loadConfig (configFile, isChild = false, next) {
  nconf.use('memory') // use memory store
  nconf.argv().env() // 从参数中读取配置，并写入 nconf
  // check config file while running at dokcer
  if (!fs.existsSync(configFile)) {
    fs.copyFileSync(path.join(__dirname, '../config.example.json'), configFile)
  }
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
  if (next && typeof next === 'function') {
    Promise
      .resolve(next())
      .then(() => {
        // Print logger
        if (!isChild) {
          winston.verbose('[prestart] * using configuration stored in: %s', configFile)
        }
      })
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
  load: (configFile, isChild = false) => {
    if (!configFile) {
      configFile = path.join(__dirname, '../data', './config.json')
    }
    if (!isChild) {
      printCopyright()
    }
    winston.level = 'info'
    loadConfig(configFile, isChild, setupWinston)
  }
}

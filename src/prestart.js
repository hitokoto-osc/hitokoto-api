'use strict'
const winston = require('winston')
const nconf = require('nconf')
const semver = require('semver')
const pkg = require('../package.json')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const dirname = path.join(__dirname, '../')

async function setupWinston() {
  const logFile =
    nconf.get('log_path') ||
    path.join(__dirname, '../', './data/logs/', pkg.name + '_error.log')

  // createDir while running at docker
  const dirPath = path.join(logFile, '../')
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)

  fs.existsSync(logFile) || fs.writeFileSync(logFile, '')
  winston.remove(winston.transports.Console)
  winston.add(winston.transports.File, {
    filename: logFile,
    level: 'error',
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles: 10,
  })
  winston.add(winston.transports.Console, {
    colorize: nconf.get('log-colorize') !== 'false',
    timestamp: function () {
      const date = new Date()
      return nconf.get('json_logging')
        ? date.toJSON()
        : date.toISOString() + ' [' + global.process.pid + ']'
    },
    level:
      !nconf.get('dev') || !(process.env && process.env.dev === 'true')
        ? 'info'
        : 'verbose',
    json: !!nconf.get('json_logging'),
    stringify: !!nconf.get('json_logging'),
  })
}

function loadConfig(configFile, next, isChild = false) {
  nconf.use('memory') // use memory store
  nconf.argv().env() // 从参数中读取配置，并写入 nconf

  // convert old config
  const oldConfigFile = path.join(__dirname, '../data/config.json')
  if (fs.existsSync(oldConfigFile)) {
    const c = require(oldConfigFile)
    const yaml = require('js-yaml')
    fs.writeFileSync(configFile, yaml.safeDump(c), 'utf-8')
  }

  // check config file while running at docker
  if (!fs.existsSync(configFile))
    fs.copyFileSync(path.join(__dirname, '../config.example.yml'), configFile)

  nconf.file({
    file: configFile,
    format: require('nconf-yaml'),
  })

  nconf.defaults({
    base_dir: dirname,
    version: pkg.version,
  })
  nconf.set('dev', !global.prod) // Inject Dev option
  if (next && typeof next === 'function') {
    Promise.resolve(next()).then(() => {
      // Print logger
      if (!isChild) {
        winston.verbose(
          '[prestart] * using configuration stored in: %s',
          configFile,
        )
      }
    })
  }
}

function printCopyright() {
  const chalk = require('chalk')
  const date = new Date()
  console.log(
    chalk.bgBlue(
      chalk.black(
        ' ' +
          pkg.name +
          ' v' +
          pkg.version +
          ' © ' +
          date.getFullYear() +
          ' All Rights Reserved. ',
      ),
    ) +
      '   ' +
      chalk.bgRed(chalk.black(' Powered by teng-koa ')),
  )
  console.log('')
  console.log(
    chalk.bgCyan(
      chalk.black(
        ' 我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。 ',
      ),
    ),
  )
}

function checkNodeVersion() {
  if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
    console.log(
      '[env_check] ' +
        chalk.white('Node.js 版本过旧，无法启动。要求版本为： ') +
        chalk.blue(pkg.engines.node),
    )
    process.exit(1)
  }
}

function check() {
  checkNodeVersion()
}

module.exports = {
  load: (configFile, isChild = false) => {
    if (!configFile)
      configFile = path.join(__dirname, '../data', './config.yml')
    if (!isChild) printCopyright()
    loadConfig(configFile, setupWinston, isChild)
  },
  check,
}

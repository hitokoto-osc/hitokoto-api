'use strict'
const nconf = require('nconf')
const semver = require('semver')
const pkg = require('../package.json')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const dirname = path.join(__dirname, '../')
const { SetupLogger } = require('./logger')
const got = require('got')
async function checkProgramUpdates() {
  const { logger } = require('./logger')
  logger.verbose('[core.selfCheck] start self update checking...')
  try {
    const { statusCode, body: data } = await got.get(
      'https://api.github.com/repos/hitokoto-osc/hitokoto-api/releases/latest',
      {
        responseType: 'json',
      },
    )
    if (statusCode !== 200) {
      logger.error(
        `[core.selfCheck] can't fetch latest program version information. API returns ${chalk.yellow(
          statusCode,
        )}`,
      )
    }
    const { tag_name: latestVersion } = data
    if (semver.gt(semver.clean(latestVersion), pkg.version)) {
      logger.warn(
        chalk.yellowBright(
          `[core.selfCheck] your program instance(${chalk.blue(
            'v' + pkg.version,
          )}) is outdated, current latest version is ${chalk.red(
            latestVersion,
          )}, please consider to update. `,
        ),
      )
    } else if (semver.lt(semver.clean(latestVersion), pkg.version)) {
      logger.warn(
        chalk.yellowBright(
          `[core.selfCheck] your running program instance(${chalk.blue(
            'v' + pkg.version,
          )}) is greater than latest version: ${chalk.red(
            latestVersion,
          )}. It might be a experimental version, please NOT use it in production.`,
        ),
      )
    } else {
      logger.verbose('[core.selfCheck] your running instance is up-to-dated.')
    }
  } catch (err) {
    logger.error(chalk.red(err.stack))
    logger.warn(
      chalk.yellow(
        "[core.selfCheck] we can't check the latest version now, skipping this step.",
      ),
    )
  }
}

async function setupWinston() {
  await SetupLogger()
}

function loadConfig(configFile, next, isChild = false, isDev = false) {
  // convert old config
  const oldConfigFile = path.join(__dirname, '../data/config.json')
  if (fs.existsSync(oldConfigFile)) {
    const c = require(oldConfigFile)
    const yaml = require('js-yaml')
    fs.writeFileSync(configFile, yaml.dump(c), 'utf-8')
    fs.unlinkSync(oldConfigFile)
  }

  // check config file while running at docker
  if (!fs.existsSync(configFile))
    fs.copyFileSync(path.join(__dirname, '../config.example.yml'), configFile)

  nconf
    .use('memory')
    .env({
      separator: '.',
      lowerCase: true,
      parseValues: true,
    })
    .argv()
    .file({
      file: configFile,
      format: require('nconf-yaml'),
    })
    .defaults({
      name: 'hitokoto',
      base_dir: dirname,
      version: pkg.version,
      url: 'https://v1.hitokoto.cn',
      api_name: 'undefined',
      server: {
        host: '127.0.0.1',
        port: 8000,
        compress_body: true,
      },
      redis: {
        host: '127.0.0.1',
        port: 6379,
        password: '',
        database: 0,
      },
      sentences_ab_switcher: {
        a: 1,
        b: 2,
      },
      remote_sentences_url:
        'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/',
      workers: 0,
      extensions: {
        netease: true,
      },
      requests: {
        enabled: true,
        hosts: [
          'v1.hitokoto.cn',
          'international.v1.hitokoto.cn',
          'api.a632079.me',
          'api.hitokoto.cn',
          'sslapi.hitokoto.cn',
        ],
      },
      telemetry: {
        performance: true,
        error: true,
        usage: true,
        debug: false,
      },
    })
  nconf.set('config_file', configFile)
  nconf.set('dev', isDev)
  if (next && typeof next === 'function') {
    doNext({
      next,
      isChild,
      configFile,
    }).catch((err) => {
      const { logger } = require('./logger')
      logger.error(err)
      process.exit(1)
    })
  }
}

function doNext(opts) {
  const { configFile, next, isChild } = opts
  return Promise.resolve(next()).then(() => {
    // Print logger
    if (!isChild) {
      const { logger } = require('./logger')
      logger.verbose(
        '[prestart] * using configuration stored in: %s',
        configFile,
      )
    }
  })
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
  load: (configFile, isChild = false, isDev = false) => {
    if (!configFile)
      configFile = path.join(__dirname, '../data', './config.yml')
    if (!isChild) printCopyright()
    loadConfig(configFile, setupWinston, isChild, isDev)
  },
  loadAsync: async (configFile, isChild = false, isDev = false) => {
    if (!configFile)
      configFile = path.join(__dirname, '../data', './config.yml')
    if (!isChild) printCopyright()
    loadConfig(configFile, undefined, isChild, isDev)
    await doNext({
      configFile,
      isChild,
      next: setupWinston,
    })
  },
  check,
  checkProgramUpdates,
}

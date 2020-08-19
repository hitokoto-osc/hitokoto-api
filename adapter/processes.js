// This file is a map of child processes
const path = require('path')
const winston = require('winston')
const colors = require('colors')
const AB = require('../src/extensions/sentencesABSwitcher')

module.exports = {
  processes: [
    {
      path: path.join(__dirname, '../src/cron.js'), // The absolute path of the process file
      name: 'cronJob', // The name of the process module
      messageListener: (message, { event, moduleName }) => {
        // emit msg to global process route
        if (message && message.key) {
          message.from = moduleName
          event.emit('message', message, moduleName)
        }
      }, // the handler of the receiving message
      isDev: false, // if set true, this process will start only in Dev
      isProd: false, // if set true, this process will start only in prod
      // if isDev and isProd both be set false, process will both start in Dev and Prod
    },
  ],
  receivers: [
    {
      key: 'switchAB',
      to: 'ab',
      from: 'cronJob',
      listener: (targetDB) => {
        winston.verbose(
          '[AB] receiving signal, switching to db: ' + colors.yellow(targetDB),
        )
        AB.setDatabase(targetDB)
      },
    },
    {
      key: 'loaded',
      to: 'core',
      from: 'cronJob',
      listener: (message, moduleName) => {
        winston.verbose('[init] all cronJobs are loaded. ')
      },
    },
    {
      key: 'error',
      to: 'core',
      from: 'cronJob',
      listener: (data, moduleName) => {
        console.log(colors.red(data))
        winston.error(
          '[init] error was thrown while loading cron jobs, process existing.',
        )
        process.exit(1)
      },
    },
  ],
}

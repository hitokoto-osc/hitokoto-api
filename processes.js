// This file is a map of child processes
const path = require('path')
const winston = require('winston')
const colors = require('colors')

module.exports = [
  {
    path: path.join(__dirname, './src/cron.js'), // The absolute path of the process file
    name: 'cronJob', // The name of the process module
    messageListener: (message) => {
      if (message === 'loaded') {
        winston.verbose('[init] all cronJobs are loaded.')
      } else if (message.key) {
        if (message.key === 'error') {
          console.log(colors.red(message.data))
          winston.error('[init] error was thrown while loading cron jobs, process existing.')
          process.exit(1)
        }
      }
    }, // the handler of the receiving message
    isDev: false, // if set true, this process will start only in Dev
    isProd: false // if set true, this process will start only in prod
    // if isDev and isProd both be set false, process will both start in Dev and Prod
  }
]

'use strict'
// Import Packages
const winston = require('winston')
const path = require('path')
const cache = require(path.join(__dirname, '../cache'))

function saveCount (ts, count) {
  cache.set('requests:count:' + ts, count, 60 * 60 * 25)
    .catch(err => {
      winston.error(err)
      saveCount(ts, count)
    })
}

module.exports = [
  '* * * * * *', // Cron Config
  () => {
    // Do something
    cache.get('requests')
      .then(requests => {
        const request = requests ? parseInt(requests) : 0
        const ts = Date.now().toString().slice(0, 10)
        saveCount(ts, request)
        winston.debug('Save Count to Cache. Requests: ' + request)
      })
      .catch(err => {
        winston.error(err)
      })
  },
  () => {
    // This function is executed when the job stops
    winston.error('Count Requests job is stopped. Kill process.')
    process.exit(1)
  },
  true, // Start the job right now,
  'Asia/Shanghai' // Timezone
]

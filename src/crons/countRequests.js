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

function saveHostsCount (ts, count) {
  cache.set('requests:hosts:count:' + ts, count, 60 * 60 * 25)
    .catch(err => {
      winston.error(err)
      saveCount(ts, count)
    })
}
function autoSave (ts, requests) {
  saveCount(ts, requests.all)
  winston.debug('Save All requests total to Cache. Requests: ' + requests.all)
  saveHostsCount(ts, requests.hosts)
  winston.debug('Save Host requests total to Cache. Requests: ' + requests.hosts)
}
module.exports = [
  '* * * * * *', // Cron Config
  () => {
    // Do something
    const ts = Date.now().toString().slice(0, 10)
    if (!global.requests) {
      Promise.all([cache.get('requests'), cache.get('requests:hosts')])
        .then(data => {
          // Init
          global.requests = {}
          global.requests.all = data[0] || 0
          global.requests.hosts = data[1] || {}
          return global.requests
        })
        .then(requests => {
          autoSave(ts, requests)
        })
    } else {
      autoSave(ts, global.requests)
    }
  },
  () => {
    // This function is executed when the job stops
    winston.error('Count Requests job is stopped. Kill process.')
    process.exit(1)
  },
  true, // Start the job right now,
  'Asia/Shanghai' // Timezone
]

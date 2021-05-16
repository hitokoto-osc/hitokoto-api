'use strict'
// Import Packages
const { logger } = require('../logger')
// const path = require('path')
// const cache = require(path.join(__dirname, '../cache'))

module.exports = [
  '* * * * * *', // Cron Config
  () => {
    // Do something
    global.originStatistics = {}
  },
  (job) => {
    // This function is executed when the job stops
    logger.error('Count Requests job is stopped. Kill process.')
    process.exit(1)
  },
  true, // Start the job right now,
  'Asia/Shanghai', // Timezone
]

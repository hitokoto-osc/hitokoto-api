// Register Cron Event
module.exports = (cron) => {
  // return true
  return [
    // Register cron
    cron.countRequests,
    cron.updateSentences,
    // cron.checkUpdate
  ]
}

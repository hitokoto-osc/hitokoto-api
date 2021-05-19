const _ = require('lodash')
const cache = require('../../cache')
const { logger } = require('../../logger')
// init data

class RequestsCounter {
  constructor() {
    this.all = 0
    this.hosts = {}
    this.cronJobProcess = undefined
  }

  convert() {
    return {
      all: this.all,
      hosts: this.hosts,
    }
  }

  async restoreRecord() {
    const fetchRequests = await Promise.all([
      cache.get('requests'),
      cache.get('requests:hosts'),
    ])
    this.all = parseInt(fetchRequests[0]) || 0
    this.hosts = fetchRequests[1] || {}
    for (const key of Object.keys(this.hosts)) {
      this.hosts[key] = parseInt(this.hosts[key])
    }
  }

  async storeRequests() {
    await Promise.all([
      cache.set('requests', this.all),
      cache.set('requests:hosts', this.hosts),
    ])
  }

  sendCronJobLatestRecord() {
    if (
      !this.cronJobProcess ||
      (this.cronJobProcess && this.cronJobProcess.instance.exitCode >= 0)
    ) {
      const processList = require('../process').staticProcess().ProcessList
      this.cronJobProcess = _.find(processList, { name: 'cronJob' })
      if (!this.cronJobProcess) {
        logger.error(
          `[web.Master.requestsCounterMerge] cronJob process is not exist!`,
        )
        throw new Error('cronJob is not exist!')
      }
    }
    if (!this.cronJobProcess.send) {
      logger.error(
        `[core.Master.requestsCounterMerge] cronJobProcess.send is undefined. Maybe instance is not exist?`,
      )
      throw new Error('cronJobProcess.send is undefined.')
    }
    // notify cronJob
    if (
      !this.cronJobProcess.instance.send({
        key: 'updateRequests',
        to: 'countRequestsCron',
        data: this.convert(),
      })
    ) {
      logger.error(
        `[core.Master.requestsCounterMerge] cronJobProcess.send return false. Maybe instance was destroyed?`,
      )
      throw new Error('cronJobProcess.send return false')
    }
  }

  getWorkersRequestsRecordHandler() {
    return (message) => {
      const { all, hosts } = message.data
      logger.debug(
        `[core.Master.requestsCounterMerge] receiving requests data from workers. all: %d, hosts: %o`,
        all,
        hosts,
      )
      this.all += all
      for (const key of Object.keys(hosts)) {
        this.hosts[key] += hosts[key]
      }
      logger.debug(
        `[core.Master.requestsCounterMerge] current instance requests data, all: %d, hosts: %o`,
        this.all,
        this.hosts,
      )
      this.storeRequests().catch((err) => {
        // TODO: maybe ignoring err is not a good idea?
        logger.error(
          `[core.Master.requestsCounterMerge] can't store requests record. Maybe redis connection is closed? Because of we default ignore this error, please contact author if it occurs frequently. error details: \n${err.merge}`,
        )
      })
      this.sendCronJobLatestRecord()
    }
  }
}

const requestsCounter = new RequestsCounter()
requestsCounter.restoreRecord().catch((err) => {
  logger.error(
    `[core.Master.requestsCounterMerge] can't restore requests records. err message: \n%s`,
    err.stack,
  )
  throw err
})
module.exports = {
  requestsCounter,
}

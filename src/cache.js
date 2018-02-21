'use strict'
// Import Packages
const nconf = require('nconf')
const bluebrid = require('bluebird')
const winston = require('winston')
// Promisify Redis
const redis = bluebrid.promisifyAll(require('redis'))

class cache {
  static connect () {
    if (this.hasOwnProperty('redis')) {
      return true
    } else {
      // Get Config
      const config = {
        host: nconf.get('redis:host') || '127.0.0.1',
        port: nconf.get('redis:port') || 6379,
        password: nconf.get('redis:password') && nconf.get('redis:password') !== '' ? nconf.get('redis:password') : false,
        db: nconf.get('redis:database') || 0
      }
      if (!config.password) {
        delete config.password
      }
      // Connect Redis
      this.redis = redis.createClient(config)
      this.redis.on('error', err => {
        winston.error(err)
        process.exit(1)
      })
      return true
    }
  }
  static command (commands, params) {
    this.connect()
    const param = params
    param[0] = 'cache:' + param[0]
    return this.redis[commands + 'Async'](param)
  }

  static set (key, v, time) {
    this.connect()
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.setAsync('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.setAsync('cache:' + key, value)
    }
  }

  static async get (key, toJson = true) {
    this.connect()
    const data = await this.redis.getAsync('cache:' + key)
    if (toJson) {
      try {
        const json = JSON.parse(data)
        return json
      } catch (e) {
        return data
      }
    } else {
      return data
    }
  }
}

module.exports = cache

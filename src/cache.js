'use strict'
const nconf = require('nconf')
const bluebrid = require('bluebird')
const winston = require('winston')
const redis = require('redis')
// Promisify Redis
bluebrid.promisifyAll(redis.RedisClient.prototype)
bluebrid.promisifyAll(redis.Multi.prototype)

class cache {
  static connect () {
    if (this.redis) {
      return true
    } else {
      // Get Config
      const config = {
        host: nconf.get('redis:host') || '127.0.0.1',
        port: nconf.get('redis:port') || 3306,
        password: nconf.get('redis:password') || '',
        db: nconf.get('redis:database') || 0
      }
      // Connect Redis
      this.redis = redis.createClient(config)
      this.redis.on('error', err => {
        winston.error(err)
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

  static set (key, value, time) {
    this.connect()
    return this.redis.setAsync('cache:' + key, value, 'EX', time)
  }

  static get (key) {
    this.connect()
    return this.redis.getAsync('cache:' + key)
  }
}

module.exports = cache

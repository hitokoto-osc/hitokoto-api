'use strict'
// Import Packages
const nconf = require('nconf')
const bluebrid = require('bluebird')
const winston = require('winston')
const colors = require('colors')
// Promisify Redis
const redis = bluebrid.promisifyAll(require('redis'))

class cache {
  static connect (newConnection = false) {
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
    if (!newConnection) {
      this.redis = redis.createClient(config)
      this.redis.on('error', err => {
        console.log(colors.red(err.stack))
        winston.error('redis connection is closed. try to reconnect.')
        cache.connect()
      })
      return true
    }
    const client = redis.createClient(config)
    return client
  }
  static connectOrSkip () {
    if (this.hasOwnProperty('redis')) {
      return true
    } else {
      return this.connect()
    }
  }
  static command (commands, params) {
    this.connectOrSkip()
    const param = params
    param[0] = 'cache:' + param[0]
    return this.redis[commands + 'Async'](param)
  }

  static set (key, v, time) {
    this.connectOrSkip()
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.setAsync('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.setAsync('cache:' + key, value)
    }
  }

  static async get (key, toJson = true) {
    this.connectOrSkip()
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

  static getClient (newConnection = false) {
    return newConnection ? this.connect(true) : this.redis
  }
}

module.exports = cache

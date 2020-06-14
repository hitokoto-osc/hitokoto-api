'use strict'
// Note: This file is a extension of cache module,
// intended to implement a a/b redis switcher to acquire a non-aware sentences update.

const Cache = require('../cache')
const bluebrid = require('bluebird')
const nconf = require('nconf')
const colors = require('colors/safe')
const winston = require('winston')
const redis = bluebrid.promisifyAll(require('redis'))

let connectionFailedAttemp = 0
const databaseA = nconf.get('sentences_ab_switchter:a') || 1
const databaseB = nconf.get('sentences_ab_switchter:b') || 2

class SentencesABSwitcher extends Cache {
  static connect (target = 'a', isDefault = false) {
    // Get Config
    const config = {
      host: nconf.get('redis:host') || '127.0.0.1',
      port: nconf.get('redis:port') || 6379,
      password: nconf.get('redis:password') && nconf.get('redis:password') !== '' ? nconf.get('redis:password') : false,
      db: target === 'a' ? databaseA : databaseB // default connect to A database
    }
    if (!config.password) {
      delete config.password
    }
    // Connect Redis
    const tmp = redis.createClient(config)
    tmp.on('connect', () => {
      connectionFailedAttemp = 0 // clear the attemp count
    })
    tmp.on('error', err => {
      console.log(colors.red(err.stack))
      if (connectionFailedAttemp >= 3) {
        winston.error('Attemp to connect to redis ' + connectionFailedAttemp + ' times, but all failed. Process exiting.')
        process.exit(1)
      }
      winston.error('failed to connect to redis. Attemp again...')
      connectionFailedAttemp++
      SentencesABSwitcher.connect()
    })
    if (isDefault) {
      this.redis = tmp // set defalt slot
    }
    this['redis' + target.toUpperCase()] = tmp
  }

  static connectOrSkip (database = 'a') {
    if (this.redis) {
      return true
    } else {
      this.connect('a', !!(database === 'a'))
      this.connect('b', !(database === 'a'))
    }
  }

  static setDatabase (target) {
    if (target === 'a') {
      this.redis = this.redisA
    } else {
      this.redis = this.redisB
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

  static getConnection (target) {
    if (target === 'a') {
      return new WrapperRedis(this.redisA)
    } else {
      return new WrapperRedis(this.redisB)
    }
  }
}

class WrapperRedis {
  constructor (redisConnection) {
    this.redis = redisConnection
  }

  command (commands, params) {
    const param = params
    param[0] = 'cache:' + param[0]
    return this.redis[commands + 'Async'](param)
  }

  set (key, v, time) {
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.setAsync('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.setAsync('cache:' + key, value)
    }
  }

  async get (key, toJson = true) {
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

  getClient () {
    return this.redis
  }
}

module.exports = SentencesABSwitcher

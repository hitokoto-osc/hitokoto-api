'use strict'
// Import Packages
const nconf = require('nconf')
const winston = require('winston')
const colors = require('colors')

const Redis = require('ioredis')

let connectionFailedAttemp = 0
class cache {
  static connect (newConnection = false) {
    // Get Config
    const config = {
      host: nconf.get('redis:host') || '127.0.0.1',
      port: nconf.get('redis:port') || 6379,
      db: nconf.get('redis:database') || 0,
      family: nconf.get('redis:family') || 4,
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true
        }
      }
    }
    if (nconf.get('redis:password') && (nconf.get('redis:password') !== '')) {
      config.password = nconf.get('redis:password')
    }
    // Connect Redis
    if (!newConnection) {
      this.redis = new Redis(config)
      this.redis.on('connect', () => {
        connectionFailedAttemp = 0 // clear the attemp count
      })
      this.redis.on('error', err => {
        console.log(colors.red(err.stack))
        if (connectionFailedAttemp >= 3) {
          winston.error('[cache] attemp to connect to redis ' + connectionFailedAttemp + ' times, but all failed, process exiting.')
          process.exit(1)
        }
        winston.error('[cache] failed to connect to redis, we will attemp again...')
        connectionFailedAttemp++
        cache.connect()
      })
      return true
    }
    const client = new Redis(config)
    return client
  }

  static connectOrSkip () {
    if (this.redis) {
      return true
    } else {
      return this.connect()
    }
  }

  static command (commands, ...params) {
    this.connectOrSkip()
    return this.redis[commands](...params)
  }

  static set (key, v, time) {
    this.connectOrSkip()
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.set('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.set('cache:' + key, value)
    }
  }

  static async get (key, toJson = true) {
    this.connectOrSkip()
    const data = await this.redis.get('cache:' + key)
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

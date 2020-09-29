'use strict'
// Import Packages
const nconf = require('nconf')
const Redis = require('ioredis')

const { handleError, ConnectionConfig } = require('./utils/cache')
class Cache {
  static connect(newConnection = false) {
    // Get Config
    if (nconf.get('redis:password') && nconf.get('redis:password') !== '') {
      ConnectionConfig.password = nconf.get('redis:password')
    }
    // Connect Redis
    if (!newConnection) {
      this.redis = new Redis(ConnectionConfig)
      this.redis.on('connect', () => nconf.set('connectionFailedAttempt', 0))
      this.redis.on('error', handleError.bind(this))
      return true
    }
    return new Redis(ConnectionConfig)
  }

  static connectOrSkip(isABSwitcher) {
    if (isABSwitcher) {
      return
    }
    return this.redis ? true : this.connect()
  }

  static async command(commands, ...params) {
    this.connectOrSkip()
    params[0] = 'cache:' + params[0]
    return this.redis[commands](params)
  }

  static async set(key, v, time) {
    await this.connectOrSkip()
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.set('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.set('cache:' + key, value)
    }
  }

  static async get(key, toJson = true) {
    await this.connectOrSkip()
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

  /**
   * Call Caller and store, or return cached Caller Data
   * @param {string} key
   * @param {number} time
   * @param {number} caller the callerFunc
   * @param {any[]} callerParams the callerFunc params
   * @param {boolean} toJSON
   */
  static async remember(key, time, ...params) {
    await this.connectOrSkip()
    if (params.length <= 0 || params.length > 3) {
      throw new Error('the length of params is wrong')
    }
    if (typeof params[0] !== 'function') {
      throw new Error('the remember caller must be a function')
    }
    const caller = params[0]
    const callerParams = params[1] ?? []
    const toJSON = params[2] ?? true
    return (
      (await this.get(key, toJSON)) ||
      (await callAndStore(caller, callerParams, key, time))
    )
  }

  static getClient(newConnection = false) {
    return newConnection ? this.connect(true) : this.redis
  }
}

const callAndStore = async (caller, params, key, time) => {
  const data = await caller(...params)
  if (data) {
    Cache.set(key, data, time)
  }
  return data
}

module.exports = Cache

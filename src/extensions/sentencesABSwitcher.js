'use strict'
// Note: This file is a extension of cache module,
// intended to implement a a/b redis switcher to acquire a non-aware sentences update.

const Cache = require('../cache')
const nconf = require('nconf')
const Redis = require('ioredis')
const databaseA = nconf.get('sentences_ab_switchter:a') || 1
const databaseB = nconf.get('sentences_ab_switchter:b') || 2

const { ConnectionConfig, handleError } = require('../utils/cache')
class SentencesABSwitcher extends Cache {
  static connect(target = 'a', isDefault = false) {
    // Get Config
    const config = { ...ConnectionConfig }
    config.db = target === 'a' ? databaseA : databaseB
    if (nconf.get('redis:password') && nconf.get('redis:password') !== '') {
      config.password = nconf.get('redis:password')
    }
    // Connect Redis
    const tmp = new Redis(config)
    tmp.on('connect', () => nconf.set('connectionFailedAttemp', 0))
    tmp.on('error', handleError.bind(this))
    if (isDefault) {
      this.redis = tmp // set defalt slot
    }
    this['redis' + target.toUpperCase()] = tmp
  }

  static connectOrSkip(database = 'a') {
    if (this.redis) {
      return true
    } else {
      this.connect('a', database === 'a')
      this.connect('b', database !== 'a')
    }
  }

  static setDatabase(target) {
    if (target === 'a') {
      this.redis = this.redisA
    } else {
      this.redis = this.redisB
    }
  }

  static getConnection(target) {
    if (target === 'a') {
      return new WrapperRedis(this.redisA)
    } else {
      return new WrapperRedis(this.redisB)
    }
  }
}

class WrapperRedis {
  constructor(redisConnection) {
    this.redis = redisConnection
  }

  command(commands, ...params) {
    return this.redis[commands](...params)
  }

  set(key, v, time) {
    const value = typeof v === 'object' ? JSON.stringify(v) : v
    if (time) {
      return this.redis.set('cache:' + key, value, 'EX', time)
    } else {
      return this.redis.set('cache:' + key, value)
    }
  }

  async get(key, toJson = true) {
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

  getClient() {
    return this.redis
  }
}

module.exports = SentencesABSwitcher

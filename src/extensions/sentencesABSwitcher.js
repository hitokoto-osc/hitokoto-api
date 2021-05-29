'use strict'
// Note: This file is a extension of cache module,
// intended to implement a a/b redis switcher to acquire a non-aware sentences update.

const Cache = require('../cache')
const nconf = require('nconf')
const Redis = require('ioredis')
const databaseA = nconf.get('sentences_ab_switcher:a') || 1
const databaseB = nconf.get('sentences_ab_switcher:b') || 2
const chalk = require('chalk')
const { logger } = require('../logger')

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
    tmp.on('connect', () => {
      this.connectionFailedAttempt = 0
    })
    tmp.on('error', handleError.bind(this))
    if (isDefault) {
      this.redis = tmp // set default slot
    }
    this['redis' + target.toUpperCase()] = tmp
  }

  static async connectOrSkip() {
    this.isABSwitcher = true
    if (this.redis) {
      return true
    } else {
      const database = (await Cache.get('hitokoto:ab')) || 'a' // 初始化时读取默认分区
      this.connect('a', database === 'a')
      this.connect('b', database !== 'a')
      this.db = database
      this.redis = this['redis' + database.toUpperCase()]
    }
  }

  static setDatabase(target) {
    logger.verbose('[AB] switching database: ' + chalk.blue(target))
    if (target === 'a') {
      this.redis = this.redisA
    } else {
      this.redis = this.redisB
    }
    this.db = target
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

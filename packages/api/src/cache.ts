import Redis from 'ioredis'
import nconf from 'nconf'

const { handleError, ConnectionConfig } = require('./utils/cache')
export class Cache {
  private static redis: Redis | null = null
  private static connectionFailedAttempt = 0
  private static isABSwitcher = false
  static connect(newConnection = false) {
    // Get Config
    if (nconf.get('redis:password') && nconf.get('redis:password') !== '') {
      ConnectionConfig.password = nconf.get('redis:password')
    }
    // Connect Redis
    if (!newConnection) {
      this.redis = new Redis(ConnectionConfig)
      this.redis.on('connect', () => {
        this.connectionFailedAttempt = 0
      })
      this.redis.on('error', handleError.bind(this))
      return true
    }
    return new Redis(ConnectionConfig)
  }

  static connectOrSkip() {
    if (this.isABSwitcher) {
      return
    }
    return this.redis ? true : this.connect()
  }

  static async command(commands: keyof Redis, ...params: any[]) {
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
   * @param {function} caller the callerFunc
   * @param {any[]} callerParams the callerFunc params
   * @param {boolean} toJSON
   * @param {object} options
   */
  static async remember(
    key,
    time,
    caller,
    callerParams = [],
    toJSON = true,
    options,
  ) {
    await this.connectOrSkip()
    if (typeof caller !== 'function') {
      throw new Error('the remember caller must be a function')
    }
    if (options?.nocache) {
      return this.callAndStore(caller, callerParams, key, time)
    }
    return (
      (await this.get(key, toJSON)) ||
      this.callAndStore(caller, callerParams, key, time)
    )
  }

  static getClient(newConnection = false) {
    return newConnection ? this.connect(true) : this.redis
  }

  private static callAndStore = async (caller, params, key, time) => {
    const data = await caller(...params)
    if (data) {
      Cache.set(key, data, time).catch((err) => {
        const { logger } = require('./logger')
        logger.error(`[cache] store data err: ${err.stack}`)
      })
    }
    return data
  }
}

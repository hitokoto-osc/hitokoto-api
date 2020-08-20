// This module is intended to impl warppers of songs in NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const { APIRemeberCaller, SDKRequestGenerator } = require('./_sdk_utils')
const Cache = require('../../cache')

/**
 * Get DJ' Detail
 * @param {string} rid DJ ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJDetail = (rid, ...options) => {
  const [realIP] = options
  return SDKRequestGenerator(sdk.dj_detail, {
    rid,
    realIP,
  })
}

/**
 * Get DJ' Detail with Cache
 * @param {string} rid DJ ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJDetaillWithCache = (rid, realIP) => {
  return Cache.remeber(
    'nm:dj:detail:' + rid,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getDJDetail, [rid, realIP]],
  )
}

/**
 * Get DJ Program Detail
 * @param {number} id DJ Program ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJProgramDetail = (id, ...options) => {
  const [realIP] = options
  return SDKRequestGenerator(sdk.dj_program_detail, { id, realIP })
}

/**
 * Get DJ Program Detail with Cache
 * @param {number} id DJ Program ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJProgramDetailWithCache = (id, realIP) => {
  return Cache.remeber(
    'nm:dj:program:info:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getDJProgramDetail, [id, realIP]],
  )
}

/**
 * Get DJ Program
 * @param {number} rid DJ ID
 * @param {number} limit (optional) body limit
 * @param {number} offset (optional) offset
 * @param {boolean} asc (optional) order type
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJProgram = (rid, limit, offset, ...options) => {
  const [asc, realIP] = options
  return SDKRequestGenerator(sdk.dj_program, {
    rid,
    limit,
    offset,
    asc,
    realIP,
  })
}

/**
 * Get DJ Program With Cache
 * @param {number} rid DJ ID
 * @param {number} limit (optional) body limit
 * @param {number} offset (optional) offset
 * @param {boolean} asc (optional) order type
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJProgramWithCache = (rid, limit, offset, ...options) => {
  const [asc, realIP] = options
  return Cache.remeber(
    `nm:dj:program:${rid}:${offset}:${limit}:${asc}`,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getDJProgram, [rid, limit, offset, asc, realIP]],
  )
}

module.exports = exports

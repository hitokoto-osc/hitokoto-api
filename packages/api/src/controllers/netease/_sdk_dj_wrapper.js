// This module is intended to impl warppers of songs in NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const { APIRememberCaller, SDKRequestGenerator } = require('./_sdk_utils')
const Cache = require('../../cache')

/**
 * Get DJ' Detail
 * @param {string} rid DJ ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJDetail = (rid, realIP) => {
  return SDKRequestGenerator(sdk.dj_detail, {
    rid,
    realIP,
  })
}

/**
 * Get DJ' Detail with Cache
 * @param {string} rid DJ ID
 * @param {string|undefined} realIP Client RealIP
 * @param {boolean} nocache NoCache
 */
exports.getDJDetailWithCache = (rid, realIP, nocache = false) => {
  return Cache.remember(
    'nm:dj:detail:' + rid,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getDJDetail, [rid, realIP]],
    true,
    {
      nocache,
    },
  )
}

/**
 * Get DJ Program Detail
 * @param {number} id DJ Program ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getDJProgramDetail = (id, realIP) => {
  return SDKRequestGenerator(sdk.dj_program_detail, { id, realIP })
}

/**
 * Get DJ Program Detail with Cache
 * @param {number} id DJ Program ID
 * @param {string|undefined} realIP Client RealIP
 * @param {boolean} nocache NoCache
 */
exports.getDJProgramDetailWithCache = (id, realIP, nocache = false) => {
  return Cache.remember(
    'nm:dj:program:info:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getDJProgramDetail, [id, realIP]],
    true,
    {
      nocache,
    },
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
exports.getDJProgram = (rid, limit, offset, asc, realIP) => {
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
 * @param {boolean} nocache NoCache
 */
exports.getDJProgramWithCache = (
  rid,
  limit,
  offset,
  asc,
  realIP,
  nocache = false,
) => {
  return Cache.remember(
    `nm:dj:program:${rid}:${offset}:${limit}:${asc}`,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getDJProgram, [rid, limit, offset, asc, realIP]],
    true,
    { nocache },
  )
}

module.exports = exports

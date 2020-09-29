// This module is intended to impl warppers of songs in NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const { APIRememberCaller, SDKRequestGenerator } = require('./_sdk_utils')
const Cache = require('../../cache')

/**
 * Get MV URL
 * @param {number} mvid mv id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getMVURL = async (mvid, realIP) => {
  return SDKRequestGenerator(sdk.mv_url, {
    mvid,
    realIP,
  })
}

/**
 * Get MV Info witch Cache
 * @param {number} mvid mv id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getMVURLWithCache = async (mvid, realIP) => {
  return Cache.remember(
    `nm:mv:url:${mvid}`,
    60 * 5, // 2 Mins
    APIRememberCaller,
    [exports.getMVURL, [mvid, realIP]],
  )
}

/**
 * Get Songs' Detail with Cache
 * @param {string} mvid Song ids string, like 1,12,123
 * @param {string|undefined} realIP Client RealIP
 */
exports.getMVDetailWithCache = (mvid, realIP) => {
  return Cache.remember(
    'nm:mv:' + mvid,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getMVDetailWithCache, [mvid, realIP]],
  )
}
/**
 * Get MV's Detail
 * @param {string} ids Song ids string, like 1,12,123
 * @param {string|undefined} realIP Client RealIP
 */
exports.getMVDetail = (mvid, realIP) => {
  return SDKRequestGenerator(sdk.mv_detail, {
    mvid,
    realIP,
  })
}

module.exports = exports

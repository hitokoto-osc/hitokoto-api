// This module is intended to impl warppers of songs in NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const { APIRemeberCaller, SDKRequestGenerator } = require('./_sdk_utils')
const Cache = require('../../cache')

/**
 * Get Songs' URLs by ids
 * @param {number[]} ids Song ids array
 * @param {number} br select in 999000, 320000, 128000. default is 320000
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongsURLs = async (ids, br = 320000, realIP) => {
  return SDKRequestGenerator(sdk.song_url, {
    id: ids.join(','),
    realIP,
    br,
  })
}

/**
 * Get Songs' Detail
 * @param {string} ids Song ids string, like 1,12,123
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongsDetail = (ids, realIP) => {
  return SDKRequestGenerator(sdk.song_detail, {
    ids,
    realIP,
  })
}

/**
 * Get Songs' Detail with Cache
 * @param {string} ids Song ids string, like 1,12,123
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongsDetailWithCache = (ids, realIP) => {
  return Cache.remeber(
    'nm:detail:' + ids,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getSongsDetail, [ids, realIP]],
  )
}

/**
 * Get Song' lyric
 * @param {number} id Song id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getLyric = (id, realIP) => {
  return SDKRequestGenerator(sdk.lyric, { id, realIP })
}

/**
 * Get Song' lyric with Cache
 * @param {number} id Song id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getLyricWithCache = (id, realIP) => {
  return Cache.remeber(
    'nm:lyric:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getLyric, [id, realIP]],
  )
}

module.exports = exports

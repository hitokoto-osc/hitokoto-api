// This module is intended to impl warppers of songs in NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const { APIRememberCaller, SDKRequestGenerator } = require('./_sdk_utils')
const Cache = require('../../cache')
const { md5 } = require('../../utils/crypto')

/**
 * Get Songs' URLs by ids
 * @param {number[]|string|number} ids Song ids array
 * @param {number} br select in 999000, 320000, 128000. default is 320000
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongsURLs = async (ids, br = 320000, realIP) => {
  if (Array.isArray(ids)) {
    ids = ids.join(',')
  } else if (!['string', 'number'].includes(typeof ids)) {
    throw new Error('ids 类型错误')
  }
  return SDKRequestGenerator(sdk.song_url, {
    id: String(ids),
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
  return Cache.remember(
    'nm:detail:' + md5(ids),
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getSongsDetail, [ids, realIP]],
  )
}

/**
 * Get Song's lyric
 * @param {number} id Song id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getLyric = (id, realIP) => {
  return SDKRequestGenerator(sdk.lyric, { id, realIP })
}

/**
 * Get Song's lyric with Cache
 * @param {number} id Song id
 * @param {string|undefined} realIP Client RealIP
 */
exports.getLyricWithCache = (id, realIP) => {
  return Cache.remember(
    'nm:lyric:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getLyric, [id, realIP]],
  )
}

/**
 * Get Song's comments
 * @param {number} id Song id
 * @param {number} limit (optional) body limit
 * @param {number} offset (optional) offset
 * @param {number} before (optional) refer to: 分页参数，取上一页最后一项的 time 获取下一页数据(获取超过5000条评论的时候需要用到)
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongComment = (id, limit, offset, ...options) => {
  const [before, realIP] = options
  return SDKRequestGenerator(sdk.comment_music, {
    id,
    limit,
    offset,
    before,
    realIP,
  })
}

/**
 * Get Song's comments with Cache
 * @param {number} id Song id
 * @param {number} id Song id
 * @param {number} limit (optional) body limit
 * @param {number} offset (optional) offset
 * @param {number} before (optional) refer to: 分页参数，取上一页最后一项的 time 获取下一页数据(获取超过5000条评论的时候需要用到)
 * @param {string|undefined} realIP Client RealIP
 */
exports.getSongCommentWithCache = (id, limit, offset, ...options) => {
  const [before, realIP] = options
  return Cache.remember(
    'nm:lyric:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getSongComment, [id, limit, offset, before, realIP]],
  )
}

module.exports = exports

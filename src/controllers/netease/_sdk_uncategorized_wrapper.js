const sdk = require('NeteaseCloudMusicApi')
const Cache = require('../../cache')
const { SDKRequestGenerator, APIRemeberCaller } = require('./_sdk_utils')
const { md5 } = require('../../utils/crypto')

/**
 * Get Album Info
 * @param {string|number} id Album ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getAlbum = (id, ...options) => {
  const [realIP] = options
  return SDKRequestGenerator(sdk.album, {
    id,
    realIP: realIP,
  })
}

/**
 * Get Album Info with Cache
 * @param {string|number} id Album ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getAlbumWitchCache = (id, ...options) => {
  const [realIP] = options
  return Cache.remeber(
    'nm:album:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getAlbum, [id, realIP]],
  )
}

/**
 * Get Artists info
 * @param {string|number} id artist ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getArtists = (id, ...options) => {
  const [realIP] = options
  return SDKRequestGenerator(sdk.artists, {
    id: String(id),
    realIP: realIP,
  })
}

/**
 * Get Artists info
 * @param {string|number} id artist ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getArtistsWitchCache = (id, ...options) => {
  const [realIP] = options
  return Cache.remeber(
    'nm:artist:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getArtists, [id, realIP]],
  )
}

/**
 * Get Playlist Detail
 * @param {number} id Playlist ID
 * @param {string|number} s recent star users' record
 * @param {string|undefined} realIP Client RealIP
 */
exports.getPlaylistDetail = (id, s, ...options) => {
  const [realIP] = options
  return SDKRequestGenerator(sdk.playlist_detail, {
    id,
    s,
    realIP: realIP,
  })
}

/**
 * Get Playlist Detail with Cache
 * @param {string|number} id Playlist ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getPlaylistDetailWithCache = (id, s, ...options) => {
  const [realIP] = options
  return Cache.remeber(
    'nm:playlist:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getPlaylistDetail, [id, s, realIP]],
  )
}

/**
 * Search
 * @param {string} keywords
 * @param {number} limit Body limit
 * @param {number} offset
 * @param {number} type Search Type
 * @param {string|undefined} realIP Client RealIP
 */
exports.search = (keywords, limit, offset, ...options) => {
  const [type, realIP] = options
  return SDKRequestGenerator(sdk.search, {
    keywords,
    limit,
    offset,
    type,
    realIP: realIP,
  })
}

/**
 * Search with Cache
 * @param {string} keywords
 * @param {number} limit Body limit
 * @param {number} offset
 * @param {number} type Search Type
 * @param {string|undefined} realIP Client RealIP
 */
exports.searchWithCache = (keywords, limit, offset, ...options) => {
  const [type, realIP] = options
  return Cache.remeber(
    `nm:search:${md5(keywords)}:${limit}:${offset}:${type}`,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.search, [keywords, limit, offset, type, realIP]],
  )
}

const sdk = require('NeteaseCloudMusicApi')
const Cache = require('../../cache')
const { SDKRequestGenerator, APIRememberCaller } = require('./_sdk_utils')
const { md5 } = require('../../utils/crypto')

/**
 * Get Album Info
 * @param {string|number} id Album ID
 * @param {string|undefined} realIP Client RealIP
 */
exports.getAlbum = (id, realIP) => {
  return SDKRequestGenerator(sdk.album, {
    id,
    realIP: realIP,
  })
}

/**
 * Get Album Info with Cache
 * @param {string|number} id Album ID
 * @param {string|undefined} realIP Client RealIP
 * @param {boolean} nocache
 */
exports.getAlbumWitchCache = (id, realIP, nocache = false) => {
  return Cache.remember(
    'nm:album:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getAlbum, [id, realIP]],
    true,
    { nocache },
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
 * @param {boolean} nocache
 */
exports.getArtistsWitchCache = (id, realIP, nocache = false) => {
  return Cache.remember(
    'nm:artist:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getArtists, [id, realIP]],
    true,
    { nocache },
  )
}

/**
 * Get Playlist Detail
 * @param {number} id Playlist ID
 * @param {string|number} s recent star users' record
 * @param {string|undefined} realIP Client RealIP
 */
exports.getPlaylistDetail = (id, s, realIP) => {
  return SDKRequestGenerator(sdk.playlist_detail, {
    id,
    s,
    realIP: realIP,
  })
}

/**
 * Get Playlist Detail with Cache
 * @param {string|number} id Playlist ID
 * @param {string|number} s recent star users' record
 * @param {string|undefined} realIP Client RealIP
 * @param {boolean} nocache
 */
exports.getPlaylistDetailWithCache = (id, s, realIP, nocache = false) => {
  return Cache.remember(
    'nm:playlist:' + id,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.getPlaylistDetail, [id, s, realIP]],
    true,
    { nocache },
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
exports.search = (keywords, limit, offset, type, realIP) => {
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
 * @param {boolean} nocache
 */
exports.searchWithCache = (
  keywords,
  limit,
  offset,
  type,
  realIP,
  nocache = false,
) => {
  return Cache.remember(
    `nm:search:${md5(keywords)}:${limit}:${offset}:${type}`,
    60 * 60 * 2, // 2 Hours
    APIRememberCaller,
    [exports.search, [keywords, limit, offset, type, realIP]],
    true,
    { nocache },
  )
}

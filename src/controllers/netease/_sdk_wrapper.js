// This module is intended to impl warppers of NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')
const Cache = require('../../cache')
const {
  neteasePickey,
  SDKRequestGenerator,
  APIRemeberCaller,
} = require('./_sdk_utils')

// Import Sub SDK Wrappers
const {
  getSongsURLs,
  getSongsDetail,
  getSongsDetailWithCache,
  getLyric,
  getLyricWithCache,
} = require('./_sdk_song_wrapper')

// Exports
module.exports = exports = {
  // Songs SDK Wrapper
  getSongsURLs,
  getSongsDetail,
  getSongsDetailWithCache,
  getLyric,
  getLyricWithCache,
}

/**
 * Get picture url by pictureID
 * @param {string} pictureID pictureID
 * @param {number} size the picture size
 */
exports.getPictureURL = (pictureID, size = 300) => {
  return `https://p3.music.126.net/${neteasePickey(
    pictureID,
  )}/${pictureID}.jpg?param=${size}y${size}`
}

/**
 * Get Album Info
 * @param {string} pictureID pictureID
 * @param {number} size the picture size
 */
exports.getPictureURL = (pictureID, size = 300) => {
  return `https://p3.music.126.net/${neteasePickey(
    pictureID,
  )}/${pictureID}.jpg?param=${size}y${size}`
}

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
 */
exports.getAlbumWitchCache = (id, realIP) => {
  return Cache.remeber(
    'nm:album:' + id,
    60 * 60 * 2, // 2 Hours
    APIRemeberCaller,
    [exports.getAlbum, [id, realIP]],
  )
}

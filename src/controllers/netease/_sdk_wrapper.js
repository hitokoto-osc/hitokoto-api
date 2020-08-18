// This module is intended to impl warppers of NeteaseCloudMusicApi
const sdk = require('NeteaseCloudMusicApi')

/**
 * Get Songs' URLs by ids
 * @param {Number[]} ids Song ids array
 * @param {Number} br select in 999000, 320000, 128000. default is 320000
 * @param {String} realIP Client RealIP
 */
exports.getSongsURLs = async (ids, br = 320000, realIP = undefined) => {
  const config = {
    id: ids.join(','),
    realIP,
    br
  }
  return sdk.song_url(config)
}

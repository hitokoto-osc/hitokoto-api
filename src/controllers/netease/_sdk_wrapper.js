// This module is intended to impl warppers of NeteaseCloudMusicApi
const { neteasePickey } = require('./_sdk_utils')

// Import Sub SDK Wrappers
const {
  getSongsURLs,
  getSongsDetail,
  getSongsDetailWithCache,
  getLyric,
  getLyricWithCache,
  getSongComment,
  getSongCommentWithCache,
} = require('./_sdk_song_wrapper')
const {
  getAlbum,
  getAlbumWitchCache,
  getArtists,
  getArtistsWitchCache,
  getPlaylistDetail,
  getPlaylistDetailWithCache,
  search,
  searchWithCache,
} = require('./_sdk_uncategorized_wrapper')
const {
  getDJDetail,
  getDJDetaillWithCache,
  getDJProgramDetail,
  getDJProgramDetailWithCache,
  getDJProgram,
  getDJProgramWithCache,
} = require('./_sdk_dj_wrapper')
const {
  getMVURL,
  getMVURLWithCache,
  getMVDetail,
  getMVDetailWithCache,
} = require('./_sdk_mv_wrapper')
// Exports
module.exports = exports = {
  // Songs SDK Wrapper
  getSongsURLs,
  getSongsDetail,
  getSongsDetailWithCache,
  getLyric,
  getLyricWithCache,
  getSongComment,
  getSongCommentWithCache,
  // Uncategorized SDK Wrapper
  getAlbum,
  getAlbumWitchCache,
  getArtists,
  getArtistsWitchCache,
  getPlaylistDetail,
  getPlaylistDetailWithCache,
  search,
  searchWithCache,
  // DJ SDK Wrapper
  getDJDetail,
  getDJDetaillWithCache,
  getDJProgramDetail,
  getDJProgramDetailWithCache,
  getDJProgram,
  getDJProgramWithCache,
  // MV SDK Wrapper
  getMVURL,
  getMVURLWithCache,
  getMVDetail,
  getMVDetailWithCache,
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

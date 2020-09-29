// This module is intended to impl warppers of NeteaseCloudMusicApi
const { neteasePicKey } = require('./_sdk_utils')

/**
 * Get picture url by pictureID
 * @param {string} pictureID pictureID
 * @param {number} size the picture size
 */
exports.getPictureURL = (pictureID, size = 300) => {
  return `https://p3.music.126.net/${neteasePicKey(
    pictureID,
  )}/${pictureID}.jpg?param=${size}y${size}`
}

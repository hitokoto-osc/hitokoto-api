const crypto = require('crypto')

exports.md5 = (rawData) => {
  if (typeof rawData !== 'string') {
    rawData = JSON.stringify(rawData)
  }
  return crypto.createHash('md5').update(rawData).digest('hex')
}

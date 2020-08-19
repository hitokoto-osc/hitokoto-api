// This module is intended to impl series wrappers of exported func that will be used in summary.
const Cache = require('../../cache')
const { getLyricWithCache } = require('./_sdk_wrapper')
const { ResponseValidationException } = require('./_sdk_exception')

exports.getLyric = async (id, params) => {
  const { realIP } = params
  const lyricCache = await Cache.get('nm:lyric:' + id)
  const lyric =
    lyricCache && lyricCache.code && lyricCache.code === 200
      ? lyricCache
      : await getLyricWithCache(id, realIP)
  if (!lyric || !lyric.code || lyric.code !== 200) {
    throw new ResponseValidationException('获取歌词错误，操作失败。', {
      statusCode: lyric ?? lyric.code,
      responseBody: lyric,
    })
  }
  return {
    id,
    lyric: {
      base:
        lyric.lrc && lyric.lrc.lyric
          ? lyric.lrc.lyric
          : '[00:00.00] 纯音乐，敬请聆听。\n',
      translate: lyric.tlyric && lyric.tlyric.lyric ? lyric.tlyric.lyric : null,
    },
  }
}

exports.getLyricWithCache = (id, params) => {
  const { isSerious } = params
  return Cache.remeber(
    'nm:lyricSeries:' + id,
    isSerious
      ? 60 * 60 * 24 * 7 // 7 Days
      : 60 * 60 * 2, // 2 Hours
    exports.getLyric,
    [id, params],
  )
}

module.exports = exports

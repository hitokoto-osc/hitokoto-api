// This module contains collections of util that will be used in summary API.
const Cache = require('../../cache')
const async = require('async')
const nconf = require('nconf')
const {
  getSongsURLs,
  getSongsDetail,
  getSongsDetailWithCache,
  getAlbum,
  getAlbumWitchCache,
  getPictureURL,
} = require('./_sdk_wrapper')
const { getLyricWithCache } = require('./_summary_wrapper')
const { ResponseValidationException } = require('./_sdk_exception')
const { md5 } = require('../../utils/crypto')

const url = nconf.get('url')

const getSummery = async (params, isSeriousSearch, realIP) => {
  let { ids, br, lyric, common } = params
  if (isSeriousSearch) {
    ids = await getValidSongIds(ids, br, realIP)
  }
  const data = await async.mapLimit(ids, 5, async (id) => {
    return Promise.all(
      lyric
        ? [getSummaryByID(id, params), getLyricWithCache(id, params)]
        : [getSummaryByID(id, params)],
    )
  })
  return handleResult(data, common)
}

const handleResult = (result, common = false) => {
  const data = {}
  const ids = []
  if (common) {
    data.songs = []
  }
  for (const _ of result) {
    const id = _[0].id
    ids.push(id)
    if (common) {
      const song = {}
      for (const $ of _) {
        Object.assign(song, $)
      }
      data.songs.push(song)
    } else {
      data[id] = {}
      for (const $ of _) {
        Object.assign(data[id], $)
      }
    }
  }
  data.ids = ids
  return data
}

const getSummaryByID = (id, params) => {
  const { nocache, quick, extraInfo, br } = params
  return nocache
    ? genSummary(id, params)
    : Cache.remember(
        'nm:song:' + id + ':' + md5(String(extraInfo)) + String(br),
        quick
          ? 60 * 60 * 2 // 2 Hours
          : 60 * 60 * 24 * 7, // 7 Days
        genSummary,
        [id, params],
      )
}

const genSummary = async (id, params) => {
  const { nocache, realIP } = params
  const data = {}
  data.id = id
  data.url = url + '/nm/redirect/music/' + id
  await parseSongDetailInfo(
    nocache
      ? await getSongsDetail(String(id), realIP)
      : await getSongsDetailWithCache(String(id), realIP),
    data,
    params,
  )
  return data
}

const parseSongDetailInfo = async (detail, data, params) => {
  const { extraInfo } = params
  if (!detail || !detail.songs || !detail.songs[0]) {
    // 添加错误处理
    const v =
      detail && detail.code === -460 // Cheating
        ? '一言节点被屏蔽，请联系一言管理员'
        : '获取信息失败'
    data.name = v
    data.artists = [v]
    data.album = {
      id: 0,
      name: v,
    }
    data.status = 500 // 特殊标识用于识别错误
    return
  }

  data.name = detail.songs[0].name
  data.artists = []
  for (const artist of detail.songs[0].ar) {
    data.artists.push(artist.name)
  }

  if (extraInfo) {
    // 添加歌手附加信息， 为以后混合搜索做准备
    appendExtraInfo(detail, data)
  }

  data.album = {}
  data.album.id = detail.songs[0].al.id
  data.album.name = detail.songs[0].al.name
  judgeDj(detail, data) // 分析是否是 dj
  const pictureId =
    detail.songs[0].al.pic_str ||
    (await tryCorrectPictureID(detail.songs[0].al.id, params))
  if (!pictureId) {
    data.album.picture =
      'https://p3.music.126.net/OXmGmFI7keckpS0IhZ0VeA==/3254554419407433.jpg?param=300y300'
    data.status = 500
    return // 无法正确获得专辑信息
  }
  data.album.picture = getPictureURL(pictureId)
  data.status = data.status ?? 200
}

const appendExtraInfo = (detail, data) => {
  if (data.extraInformation) {
    data.extraInformation.artists = detail.songs[0].ar
  } else {
    data.extraInformation = {
      artists: detail.songs[0].ar,
    }
  }
}

const judgeDj = (detail, data) => {
  if (detail.songs[0].djId) {
    data.type = 'dj'
    if (data.extraInformation) {
      data.extraInformation.djId = detail.songs[0].djId
    } else {
      data.extraInformation = {
        djId: detail.songs[0].djId,
      }
    }
    // 这里预留一个关联性获取 dj 歌曲的锅子
  } else {
    data.type = 'song'
  }
}

const tryCorrectPictureID = async (albumID, params) => {
  const { realIP, nocache } = params
  const album = await (nocache
    ? getAlbum(albumID, realIP)
    : getAlbumWitchCache(albumID, realIP))
  return album.songs &&
    album.songs[0] &&
    album.songs[0].al &&
    album.songs[0].al.pic_str
    ? album.songs[0].al.pic_str
    : album.picId_str
}

/**
 * Get valid ids of songs
 * @param {number[]} ids the song ids
 * @param {number} br select in 999000, 320000, 128000. default is 320000
 * @param {string} realIP Client RealIP
 */
const getValidSongIds = async (ids, br, realIP) => {
  const body = await getSongsURLs(ids, br, realIP)
  // gen valid id list
  ids = []
  for (const s of body.data) {
    if (s.code !== 404 && s.url) {
      ids.push(s.id)
    }
  }
  if (ids.length === 0) {
    throw new ResponseValidationException('有效 IDs 列表为空，操作失败。', {
      statusCode: body.code,
      responseBody: body,
    })
  }
  return ids
}

module.exports = {
  getSummery,
}

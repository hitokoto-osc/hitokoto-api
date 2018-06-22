// Import Packages
const NeteaseMusic = require('simple-netease-cloud-music')
const async = require('async')
const { MusicClient } = require('netease-music-sdk')
const pify = require('pify')
const cache = require('../cache')
const nconf = require('nconf')
const nm = new NeteaseMusic()
const user = require('../../user')
const sdk = new MusicClient()
sdk.load(user)
const controllers = {}

// get mv data
controllers.mv = async (ctx, next) => {
  let mvid
  try {
    mvid = Number.parseInt(ctx.params.mvid)
  } catch (e) {
    ctx.body = {
      status: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  let result = await cache.get(`nm:mv:${mvid}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  try {
    result = await sdk.getMvInfo(mvid)
    cache.set(`nm:mv:${mvid}`, result, 60 * 60 * 2)
    ctx.body = result
  } catch (e) {
    ctx.status = 404
    ctx.body = {
      status: 404
    }
  }
}

// Get DJ Program Info
controllers.djProgramInfo = async (ctx, next) => {
  let pid
  try {
    pid = Number.parseInt(ctx.params.pid)
  } catch (e) {
    ctx.body = {
      code: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  let result = await cache.get(`nm:dj:program:info:${pid}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getRadioProgramInfo(pid)
  if (result && result.code === 200) {
    cache.set(`nm:dj:program:info:${pid}`, result, 60 * 60 * 2)
  }
  ctx.body = result
}

// Get DJ detail
controllers.djDetail = async (ctx, next) => {
  let rid
  try {
    rid = Number.parseInt(ctx.params.rid)
  } catch (e) {
    ctx.body = {
      code: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  let result = await cache.get(`nm:dj:info:${rid}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getRadioInfo(rid)
  if (result && result.code === 200) {
    cache.set(`nm:dj:info:${rid}`, result, 60 * 60 * 2)
  }
  ctx.body = result
}

// Get DJ Program
controllers.djProgram = async (ctx, next) => {
  let rid
  let limit
  let offset
  try {
    rid = Number.parseInt(ctx.params.rid)
    limit = ctx.query && ctx.query.limit && typeof ctx.query.limit === 'number' ? ctx.query.limit : 30
    offset = ctx.query && ctx.query.offset && typeof ctx.query.limit === 'number' ? ctx.query.limit : 0
  } catch (e) {
    ctx.body = {
      code: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  const asc = !!(ctx.query && ctx.query.asc)
  let result = await cache.get(`nm:dj:program:${rid}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getRadioProgram(rid, asc, limit, offset)
  if (result && result.code === 200) {
    cache.set(`nm:dj:program:${rid}`, result, 60 * 60 * 2)
  }
  ctx.body = result
}

// Get User DJ
controllers.userDj = async (ctx, next) => {
  let uid
  let offset
  let limit
  try {
    uid = Number.parseInt(ctx.params.uid)
    limit = ctx.query && ctx.query.limit && typeof ctx.query.limit === 'number' ? ctx.query.limit : 30
    offset = ctx.query && ctx.query.offset && typeof ctx.query.limit === 'number' ? ctx.query.limit : 0
  } catch (e) {
    ctx.body = {
      code: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  let result = await cache.get(`nm:user:dj:${uid}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getUserDj(uid, limit, offset)
  if (result.code && result.code === 200) {
    cache.set(`nm:user:dj:${uid}`, result, 60 * 60 * 2)
  }
  ctx.body = result
}

// Get Music Comment
controllers.musicComment = async (ctx, next) => {
  let id
  let offset
  let limit
  try {
    id = Number.parseInt(ctx.params.id)
    limit = ctx.query && ctx.query.limit && typeof ctx.query.limit === 'number' ? ctx.query.limit : 30
    offset = ctx.query && ctx.query.offset && typeof ctx.query.limit === 'number' ? ctx.query.limit : 0
  } catch (e) {
    ctx.body = {
      code: 400,
      message: '参数必须为数字',
      ts: Date.now()
    }
    return
  }
  let result = await cache.get(`nm:music:comment:${id}:${limit}:${offset}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getSongComment(id, limit, offset)
  if (result.code && result.code === 200) {
    cache.set(`nm:music:comment:${id}:${limit}:${offset}`, result, 60 * 60 * 2) // 2 Hour
  }
  ctx.body = result
}

// Get Music record
controllers.record = async (ctx, next) => {
  let uid
  try {
    uid = Number.parseInt(ctx.params.uid)
  } catch (e) {
    ctx.code = 400
    ctx.body = {
      status: 400,
      message: 'uid 必须为数字',
      ts: Date.now()
    }
    return
  }
  const type = ctx.query && ctx.query.weekly ? 1 : 0
  let result = await cache.get(`nm:user:record:${uid}:${type}`, false)
  if (result) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = result
    return
  }
  result = await sdk.getUserRecord(uid, type)
  if (result.code && result.code === 200) {
    cache.set(`nm:user:record:${uid}:${type}`, result, 60 * 60 * 2)
  }
  ctx.body = result
}

// Get Music Summary
controllers.summary = async (ctx, next) => {
  // Remove End ','
  const id = ctx.params.id && ctx.params.id.endsWith(',') ? ctx.params.id.slice(0, ctx.params.id.length - 1) : ctx.params.id
  // Limit 100 ids
  if (id.match(',') && id.split(',').length > 100) {
    Response400(ctx, 1)
    return
  }
  if (ctx.query.quick) {
    // Without Check song whether is blocked
    const ret = await quickSummary(id, ctx)
    if (ret) {
      const data = ctx.query && ctx.query.common ? handleResult(ret, true) : handleResult(ret)
      data.code = 200
      data.message = 'ok'
      ctx.body = data
    } else {
      Response400(ctx)
    }
  } else {
    const ret = await silentSummary(id, ctx)
    if (ret) {
      const data = ctx.query && ctx.query.common ? handleResult(ret, true) : handleResult(ret)
      data.code = 200
      data.message = 'ok'
      ctx.body = data
    } else {
      Response400(ctx)
    }
  }
}

// Redirect Music URL
controllers.redirect = async (ctx, next) => {
  const ret = await nm.url(ctx.params.id)
  if (ret && ret.data && ret.data[0].url) {
    ctx.redirect(ret.data[0].url.replace(/http:\/\/m(\d+)[a-zA-Z]*/, 'https://m$1'))
  } else {
    Response400(ctx)
  }
}

const getType = ctx => {
  if (!(ctx.query && ctx.query.type)) {
    return 1
  }
  const type = ctx.query.type.toLocaleUpperCase()
  switch (type) {
    case 'ALBUM':
      return 10
    case 'ARTIST':
      return 100
    case 'DJ':
      return 1009
    case 'LYRIC':
      return 1006
    case 'MV':
      return 1004
    case 'PLAYLIST':
      return 1000
    case 'SONG':
      return 1
    case 'USER':
      return 1002
    default:
      return 1
  }
}

// Search API
controllers.search = async (ctx, next) => {
  const keyword = ctx.params.keyword
  const limit = ctx.query && ctx.query.limit && typeof ctx.query.limit === 'number' ? ctx.query.limit : 30
  const offset = ctx.query && ctx.query.offset && typeof ctx.query.limit === 'number' ? ctx.query.limit : 0
  const type = getType(ctx)
  let ret = await cache.get(`nm:search:${keyword}:${limit}:${offset}:${type}`)
  if (ret) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = ret
    return
  }
  ret = await sdk.search(keyword, type, limit, offset)
  cache.set(`nm:search:${keyword}:${limit}:${offset}:${type}`, ret, 60 * 60 * 2) // Cache 2 Hour
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Playlist API
controllers.playlist = async (ctx, next) => {
  let ret
  let Cache = await cache.get('nm:playlist:' + ctx.params.id, false)
  if (Cache) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = Cache
    return
  } else {
    ret = await nm.playlist(ctx.params.id)
    if (ret.code !== 404) {
      cache.set('nm:playlist:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
    }
  }
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Picture API
controllers.picture = async (ctx, next) => {
  const ret = ctx.params.height ? await nm.picture(ctx.params.id, ctx.params.height) : await nm.picture(ctx.params.id)
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Artist API
controllers.artist = async (ctx, next) => {
  let ret
  let Cache = await cache.get('nm:artist:' + ctx.params.id, false)
  if (Cache) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = Cache
    return
  } else {
    ret = await nm.artist(ctx.params.id)
    cache.set('nm:artist:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
    if (ret.code === 200) {
      cache.set('nm:album:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
    }
  }
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Album API
controllers.album = async (ctx, next) => {
  let ret
  let Cache = await cache.get('nm:album:' + ctx.params.id, false)
  if (Cache) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = Cache
    return
  } else {
    ret = await nm.album(ctx.params.id)
    if (ret.code === 200) {
      cache.set('nm:album:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
    }
  }
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Lyric API
controllers.lyric = async (ctx, next) => {
  let ret
  let Cache = await cache.get('nm:lyric:' + ctx.params.id, false)
  if (Cache) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = Cache
    return
  } else {
    ret = await nm.lyric(ctx.params.id)
    cache.set('nm:lyric:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
  }
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Music URL API
controllers.url = async (ctx, next) => {
  const ret = await nm.url(ctx.params.id)
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Song Detail API
controllers.detail = async (ctx, next) => {
  let ret
  let Cache = await cache.get('nm:detail:' + ctx.params.id, false)
  if (Cache) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = Cache
    return
  } else {
    ret = await nm.song(ctx.params.id)
    if (Array.isArray(ret.songs) && ret.songs.length > 0) {
      cache.set('nm:detail:' + ctx.params.id, ret, 60 * 60 * 2)
    }
  }
  ctx.body = ret || {
    code: 400,
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

const Response400 = (ctx, code = 0) => {
  switch (code) {
    case 1:
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: 'id 数超出限制，最多为 20 个',
        feedback: '访问 /status 获得详细信息',
        ts: Date.now()
      }
      break

    default:
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '请求错误，乐曲不存在或者版权受限',
        feedback: '访问 /status 获得详细信息',
        ts: Date.now()
      }
      break
  }
}

const silentSummary = async (id, ctx) => {
  // First, Get Music URL
  const URLs = await nm.url(id)
  if (URLs && Array.isArray(URLs.data) && URLs.data.length > 0) {
    const ids = []
    for (let _ of URLs.data) {
      if (_.code !== 404 && _.url) {
        ids.push(_.id)
      }
    }
    if (ids.length > 0) {
      const result = await pify(async).mapLimit(ids, 5, async id => {
        if (ctx.query && ctx.query.lyric) {
          const ret = await Promise.all([handleSummary(id, nconf.get('url'), true), getLyric(id, true)])
          return ret
        } else {
          const ret = await Promise.all([handleSummary(id, nconf.get('url'), true)])
          return ret
        }
      })
      return result
    } else {
      return false
    }
  } else {
    return false
  }
}

const quickSummary = async (ID, ctx) => {
  const ids = ID.split(',')
  const result = await pify(async).mapLimit(ids, 5, async id => {
    if (ctx.query && ctx.query.lyric) {
      return Promise.all([handleSummary(id, nconf.get('url')), getLyric(id)])
    } else {
      return Promise.all([handleSummary(id, nconf.get('url'))])
    }
  })
  return result
}

const handleSummary = async (id, url, check = false) => {
  let Cache
  Cache = await cache.get('nm:song:' + id)
  if (Cache) {
    return Cache
  }

  const cacheTime = check ? 60 * 60 * 24 * 7 : 60 * 60 * 2
  const data = {}
  data.id = id
  data.url = url + '/nm/redirect/music/' + id

  // Get Music Detail
  let detail
  Cache = await cache.get('nm:detail:' + id)
  if (Cache) {
    detail = Cache
  } else {
    detail = await nm.song(id.toString())
    cache.set('nm:detail:' + id, detail, cacheTime)
  }
  data.name = detail.songs[0].name
  data.artists = []
  for (let artist of detail.songs[0].ar) {
    data.artists.push(artist.name)
  }
  data.album = {}
  data.album.id = detail.songs[0].al.id
  data.album.name = detail.songs[0].al.name

  let album
  Cache = await cache.get('nm:album:' + detail.songs[0].al.id)
  if (Cache) {
    album = Cache
  } else {
    album = await nm.album(detail.songs[0].al.id.toString())
    cache.set('nm:album:' + detail.songs[0].al.id, album, cacheTime) // Cache 2 Hour
  }
  data.album.picture = (await nm.picture(album.songs[0].al.pic_str)).url
  cache.set('nm:song:' + id, data, cacheTime)
  return data
}

const getLyric = async (id, check = false) => {
  let Cache
  Cache = await cache.get('nm:lyricSeries:' + id)
  if (Cache) {
    return Cache
  }
  const cacheTime = check ? 60 * 60 * 24 * 7 : 60 * 60 * 2
  // Get Lyric
  let lyric
  Cache = await cache.get('nm:lyric:' + id)
  if (Cache) {
    lyric = Cache
  } else {
    lyric = await nm.lyric(id.toString())
    cache.set('nm:lyric:' + id, lyric, cacheTime)
  }
  const data = {}
  data.id = id
  data.lyric = {}
  data.lyric.base = (lyric.lrc && lyric.lrc.lyric) ? lyric.lrc.lyric : '[00:00.00] 纯音乐，敬请聆听。\n'
  data.lyric.translate = (lyric.tlyric && lyric.tlyric.lyric) ? lyric.tlyric.lyric : null
  cache.set('nm:lyricSeries:' + id, data, cacheTime)
  return data
}

const handleResult = (result, common = false) => {
  const data = {}
  const ids = []
  if (common) {
    data.songs = []
  }
  for (let _ of result) {
    const id = _[0].id
    ids.push(id)
    if (common) {
      const song = {}
      for (let $ of _) {
        Object.assign(song, $)
      }
      data.songs.push(song)
    } else {
      data[id] = {}
      for (let $ of _) {
        Object.assign(data[id], $)
      }
    }
  }
  data.ids = ids
  return data
}

module.exports = controllers

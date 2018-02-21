// Import Packages
const NeteaseMusic = require('simple-netease-cloud-music')
const async = require('async')
const pify = require('pify')
const cache = require('../cache')
const nm = new NeteaseMusic()

const controllers = {}
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

// Search API
controllers.search = async (ctx, next) => {
  let ret
  if (await cache.get('nm:search:' + ctx.params.id)) {
    ret = await cache.get('nm:search:' + ctx.params.id)
  } else {
    ret = await nm.search(ctx.params.id)
    cache.set('nm:search:' + ctx.params.id, ret, 60 * 60 * 2) // Cache 2 Hour
  }
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
    if (ret.songs.length > 0) {
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
  if (URLs && URLs.data && URLs.data.length > 0) {
    const ids = []
    for (let _ of URLs.data) {
      if (_.code !== 404 && _.url) {
        ids.push(_.id)
      }
    }
    if (ids.length > 0) {
      const result = await pify(async).mapLimit(ids, 5, async id => {
        if (ctx.query && ctx.query.lyric) {
          const ret = await Promise.all([handleSummary(id, true), getLyric(id, true)])
          return ret
        } else {
          const ret = await Promise.all([handleSummary(id, true)])
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
      return Promise.all([handleSummary(id), getLyric(id)])
    } else {
      return Promise.all([handleSummary(id)])
    }
  })
  return result
}

const handleSummary = async (id, check = false) => {
  let Cache
  Cache = await cache.get('nm:song:' + id)
  if (Cache) {
    return Cache
  }

  const cacheTime = check ? 60 * 60 * 24 * 7 : 60 * 60 * 2
  const data = {}
  data.id = id
  data.url = 'https://api.a632079.me/nm/redirect/music/' + id

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

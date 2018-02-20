// Import Packages
const NeteaseMusic = require('simple-netease-cloud-music')
const cache = require('../cache')
const nm = new NeteaseMusic()

const controllers = {}
// Get Music Summary
controllers.summary = async (ctx, next) => {
  // First, Get Music URL
  const URLs = await nm.url(ctx.params.id)
  if (URLs && URLs.data && URLs.data.length > 0) {
    const ids = []
    const data = {}
    for (let _ of URLs.data) {
      if (_.code !== 404 && _.url) {
        ids.push(_.id)
        data[_.id] = {}
        data[_.id].url = 'https://api.a632079.me/nm/redirect/music/' + _.id

        // Get Music Detail
        let detail
        if (await cache.get('nm:detail:' + _.id)) {
          detail = await cache.get('nm:detail:' + _.id)
        } else {
          detail = await nm.song(_.id.toString())
          cache.set('nm:detail:' + _.id, detail, 60 * 60 * 8) // Cache 8 Hour
        }
        data[_.id].name = detail.songs[0].name
        data[_.id].artists = []
        for (let artist of detail.songs[0].ar) {
          data[_.id].artists.push(artist.name)
        }
        data[_.id].album = {}
        data[_.id].album.id = detail.songs[0].al.id
        data[_.id].album.name = detail.songs[0].al.name

        let album
        if (await cache.get('nm:album:' + detail.songs[0].al.id)) {
          album = await cache.get('nm:album:' + detail.songs[0].al.id)
        } else {
          album = await nm.album(detail.songs[0].al.id.toString())
          cache.set('nm:album:' + detail.songs[0].al.id, album, 60 * 60 * 16) // Cache 16 Hour
        }
        data[_.id].album.picture = (await nm.picture(album.songs[0].al.pic_str)).url

        // Get Lyric
        if (ctx.query && ctx.query.lyric) {
          let lyric
          if (await cache.get('nm:lyric:' + _.id)) {
            lyric = await cache.get('nm:lyric:' + _.id)
          } else {
            lyric = await nm.lyric(_.id.toString())
            cache.set('nm:lyric:' + _.id, lyric, 60 * 60 * 16) // Cache 16 Hour
          }

          data[_.id].lyric = {}
          data[_.id].lyric.base = (lyric.lrc && lyric.lrc.lyric) ? lyric.lrc.lyric : '[00:00.00]纯音乐，敬请聆听。\n'
          data[_.id].lyric.translate = (lyric.tlyric && lyric.tlyric.lyric) ? lyric.tlyric.lyric : null
        }
      }
      if (ids.length > 0) {
        data.ids = ids
        ctx.body = data
      } else {
        Response400(ctx)
      }
    }
  } else {
    Response400(ctx)
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
  const ret = await nm.search(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Playlist API
controllers.playlist = async (ctx, next) => {
  const ret = await nm.playlist(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Picture API
controllers.picture = async (ctx, next) => {
  const ret = ctx.params.height ? await nm.picture(ctx.params.id, ctx.params.height) : await nm.picture(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Artist API
controllers.artist = async (ctx, next) => {
  const ret = ctx.params.id
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Album API
controllers.album = async (ctx, next) => {
  const ret = await nm.album(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Lyric API
controllers.lyric = async (ctx, next) => {
  const ret = await nm.lyric(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Music URL API
controllers.url = async (ctx, next) => {
  const ret = await nm.url(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

// Song Detail API
controllers.detail = async (ctx, next) => {
  const ret = await nm.song(ctx.params.id)
  ctx.body = ret || {
    message: 'API 在请求时出现了问题，再试一下看看？',
    feedback: '访问 /status 获得详细信息',
    now: new Date().toString()
  }
}

const Response400 = ctx => {
  ctx.status = 400
  ctx.body = {
    message: '请求错误，乐曲不存在或者版权受限',
    feedback: '访问 /status 获得详细信息',
    ts: Date.now()
  }
}

module.exports = controllers

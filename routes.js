'use strict'
module.exports = (router, controller) => {
  // Route Map
  /* router.get('/', async (ctx, next) => {
    ctx.body = {
      message: 'Hello World',
      ts: Date.now()
    }
  })
  */
  router.get('/test', async ctx => {
    const nconf = require('nconf')
    const os = require('os')
    let memoryUsage = 0
    for (let v of Object.values(process.memoryUsage())) {
      memoryUsage += parseInt(v)
    }
    memoryUsage = memoryUsage / (1024 * 1024)
    ctx.body = {
      header: ctx.headers,
      host: ctx.request.host,
      server_id: nconf.get('api_name'),
      server_status: {
        memory: {
          totol: os.totalmem() / (1024 * 1024),
          free: os.freemem() / (1024 * 1024),
          usage: memoryUsage
        },
        cpu: os.cpus(),
        load: os.loadavg()
      },
      hostname: ctx.request.hostname,
      URL: ctx.request.URL,
      url: ctx.request.url,
      origin: ctx.request.origin,
      originalUrl: ctx.request.originalUrl,
      queryParams: ctx.query,
      queryLength: ctx.query && ctx.query.c ? ctx.query.c.length : '',
      now: new Date().toUTCString()
    }
  })
  router.get('/', controller.hitokoto)
  // router.get('/test', controller.hello.index)
  router.get('/status', controller.status)

  // Netease API
  router.get('/nm/search/:keyword', controller.netease.search)
  router.get('/nm/playlist/:id', controller.netease.playlist)
  router.get('/nm/picture/:id/:height?', controller.netease.picture)
  router.get('/nm/artist/:id', controller.netease.artist)
  router.get('/nm/album/:id', controller.netease.album)
  router.get('/nm/lyric/:id', controller.netease.lyric)
  router.get('/nm/url/:id', controller.netease.url)
  router.get('/nm/detail/:id', controller.netease.detail)
  router.get('/nm/summary/:id', controller.netease.summary)
  router.get('/nm/redirect/music/:id', controller.netease.redirect)
  router.get('/nm/record/:uid', controller.netease.record)
  router.get('/nm/comment/music/:id', controller.netease.musicComment)
  router.get('/nm/url/mv/:mvid', async (ctx) => {
    ctx.redirect(301, `/nm/mv/${ctx.params.mvid}`)
  })
  router.get('/nm/mv/:mvid', controller.netease.mv)
  // router.get('/nm/dj/program/detail/:pid', controller.netease.djProgramInfo)
  router.get('/nm/user/dj/:uid', controller.netease.userDj)
  router.get('/nm/dj/:rid', controller.netease.djProgram)
  router.get('/nm/dj/detail/:rid', controller.netease.djDetail)

  return router
}

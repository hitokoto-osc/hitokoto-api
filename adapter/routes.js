const nconf = require('nconf')

module.exports = (router, middleware, controller) => {
  // Route Map
  /* router.get('/', async (ctx, next) => {
    ctx.body = {
      message: 'Hello World',
      ts: Date.now()
    }
  })
  */
  router.get('/ping', (ctx) => {
    ctx.status = 200
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {},
      ts: Date.now(),
    }
  })
  if (nconf.get('dev')) {
    router.get('/crash', async (ctx) => {
      throw new Error('崩溃测试')
    })
    router.get('/test', async (ctx) => {
      const nconf = require('nconf')
      const os = require('os')
      let memoryUsage = 0
      Object.values(process.memoryUsage()).forEach((v) => {
        memoryUsage += parseInt(v)
      })
      memoryUsage = memoryUsage / (1024 * 1024)
      ctx.body = {
        header: ctx.headers,
        host: ctx.request.host,
        server_id: nconf.get('api_name'),
        server_status: {
          memory: {
            total: os.totalmem() / (1024 * 1024),
            free: os.freemem() / (1024 * 1024),
            usage: memoryUsage,
          },
          cpu: os.cpus(),
          load: os.loadavg(),
        },
        hostname: ctx.request.hostname,
        URL: ctx.request.URL,
        url: ctx.request.url,
        origin: ctx.request.origin,
        originalUrl: ctx.request.originalUrl,
        queryParams: ctx.query,
        queryLength: ctx.query && ctx.query.c ? ctx.query.c.length : '',
        now: new Date().toUTCString(),
      }
    })
  }

  router.all('/', controller.hitokoto.entry) // 兼容文档说明
  // router.get('/test', controller.hello.index)
  router.get('/status', controller.status.entry)

  // Netease API
  if (nconf.get('extensions:netease')) {
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
    router.get('/nm/record/:uid', (ctx) => {
      ctx.status = 503
      ctx.body = {
        status: 503,
        message: '由于此接口需登录后才能使用，因此本接口已移除。',
        data: null,
        ts: Date.now(),
      }
    })
    router.get('/nm/comment/music/:id', controller.netease.music_comment)
    router.get('/nm/url/mv/:mvid', async (ctx) => {
      ctx.redirect(301, `/nm/mv/${ctx.params.mvid}`)
    })
    router.get('/nm/mv/:mvid', controller.netease.mv)
    router.get('/nm/mv/url/:mvid', controller.netease.mv_url)
    router.get('/nm/dj/:rid', controller.netease.dj_program)
    router.get('/nm/dj/program/detail/:id', controller.netease.dj_program_info)
    router.get('/nm/user/dj/:uid', (ctx) => {
      ctx.status = 503
      ctx.body = {
        status: 503,
        message: '由于此接口需登录后才能使用，因此本接口已移除。',
        data: null,
        ts: Date.now(),
      }
    })
    router.get('/nm/dj/detail/:rid', controller.netease.dj_detail)
  }
  return router
}

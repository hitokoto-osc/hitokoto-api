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
  router.get('/', controller.hitokoto)
  // router.get('/test', controller.hello.index)
  router.get('/status', controller.status)

  // Netease API
  router.get('/nm/search/:id', controller.netease.search)
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

  return router
}

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

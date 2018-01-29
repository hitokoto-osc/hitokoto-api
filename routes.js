'use strict'
module.exports = (router, controller) => {
  // Route Map
  router.get('/', async (ctx, next) => {
    ctx.body = {
      message: 'Hello World',
      ts: Date.now()
    }
  })

  router.get('/test', controller.hello.index)
  router.get('/status', controller.status.status)
  return router
}

// module ctx is intended to extend Koa Context with series methods.

module.exports = exports = (config) => {
  return async (ctx, next) => {
    await next()
  }
}

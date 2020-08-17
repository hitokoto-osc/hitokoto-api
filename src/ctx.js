// module ctx is intended to extend Koa Context with series methods.

exports = (config) => {
  return async (ctx, next) => {
    await next()
  }
}

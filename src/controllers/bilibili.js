const SDK = require('bilibili-api').default
// const cache = require('../cache')
const sdk = new SDK()
const controllers = {}

controllers.CommonSearch = async (ctx) => {
  const page = ctx.query && ctx.query.page ? ctx.query.page : 20
  const limit = ctx.query && ctx.query.limit ? ctx.query.limit : 30
  const result = await sdk.Search.keyword(ctx.params.keyword, page, limit)
  ctx.body = result
}

module.exports = controllers

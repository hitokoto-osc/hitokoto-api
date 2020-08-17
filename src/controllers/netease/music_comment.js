// This module is intended to get song comments
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
  limit: Joi.number().min(1).max(10000).default(20),
  offset: Joi.number().min(0).default(0),
  before: Joi.number(), // 分页参数，取上一页最后一项的 time 获取下一页数据(获取超过5000条评论的时候需要用到)
  nocache: Joi.boolean().default(false)
})

async function getSongComments (params, ctx) {
  const {
    id,
    limit,
    offset,
    before
  } = params
  const result = await sdk.comment_music({
    id,
    limit,
    offset,
    before,
    realIP: ctx.get('X-Real-IP')
  })
  if (result.status !== 200) {
    ctx.body = {
      status: result.status,
      message: '上游错误',
      data: result.body,
      ts: Date.now()
    }
    return
  }
  return result.body
}

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!await ValidateParams(params, schema, ctx)) { // validateParams
    return
  }
  const data = await (params.nocache ? getSongComments(params, ctx) : Cache.remeber(
    params.time
      ? `nm:music:comment:${params.id}:${params.limit}:${params.offset}:${params.time}`
      : `nm:music:comment:${params.id}:${params.limit}:${params.offset}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getSongComments(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

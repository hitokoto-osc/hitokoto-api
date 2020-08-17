// This module is intended to get MV URL
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  mvid: Joi.number().min(1).max(1000000000000).required(),
  nocache: Joi.boolean().default(false)
})

async function getMVURL (params, ctx) {
  const {
    mvid: id
  } = params
  const result = await sdk.mv_url({
    id,
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
  const data = await (params.nocache ? getMVURL(params, ctx) : Cache.remeber(
    params.time
      ? `nm:mv:url:${params.id}`
      : `nm:mv:url:${params.id}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getMVURL(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

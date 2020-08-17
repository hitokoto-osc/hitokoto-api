// This module is intended to get artist records
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required()
})

async function getArtistsDetail (params, ctx) {
  const {
    id
  } = params
  const result = await sdk.artists({
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
  const data = await (params.nocache ? getArtistsDetail(params, ctx) : Cache.remeber(
    `nm:artist:${params.id}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getArtistsDetail(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

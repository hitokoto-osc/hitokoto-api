// This module is intended to get DJ Program details
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  rid: Joi.number().min(1).max(1000000000000).required(),
  limit: Joi.number().min(1).max(10000).default(30),
  offset: Joi.number().min(0).default(0),
  asc: Joi.boolean().default(false),
  nocache: Joi.boolean().default(false)
})

async function getDJProgram (params, ctx) {
  const {
    rid,
    limit,
    offset,
    asc
  } = params
  const result = await sdk.dj_program({
    rid,
    limit,
    offset,
    asc,
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
  const data = await (params.nocache ? getDJProgram(params, ctx) : Cache.remeber(
    `nm:dj:program:${params.pid}:${params.offset}:${params.limit}:${params.asc}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getDJProgram(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

// This module is intended to get DJ details
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  rid: Joi.number().min(1).max(1000000000000).required(),
  nocache: Joi.boolean().default(false),
})

async function getDJDetails(params, ctx) {
  const { rid } = params
  const result = await sdk.dj_detail({
    rid,
    realIP: ctx.get('X-Real-IP'),
  })
  if (result.status !== 200) {
    ctx.body = {
      status: result.status,
      message: '上游错误',
      data: result.body,
      ts: Date.now(),
    }
    return
  }
  return result.body
}

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const data = await (params.nocache
    ? getDJDetails(params, ctx)
    : Cache.remeber(
        `nm:dj:detail:${params.rid}`,
        60 * 60 * 2, // 2 Hours
        async () => {
          return getDJDetails(params, ctx)
        },
      ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

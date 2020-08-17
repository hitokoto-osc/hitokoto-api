// This module is intended to get DJ Program details
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
  nocache: Joi.boolean().default(false)
})

async function getDJProgramDetails (params, ctx) {
  const {
    id
  } = params
  const result = await sdk.dj_program_detail({
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
  const data = await (params.nocache ? getDJProgramDetails(params, ctx) : Cache.remeber(
    `nm:dj:program:info:${params.id}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getDJProgramDetails(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

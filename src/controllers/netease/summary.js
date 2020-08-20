// This module is intended to search songs
const Joi = require('joi')
const { getSummery } = require('./_summary_utils')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.string(),
  ids: Joi.array().items(Joi.number().min(1).max(1000000000000000)).required(),
  br: Joi.number().valid(999000, 320000, 128000).default(320000), // flac, 320k, 128k
  lyric: Joi.boolean().default(false),
  common: Joi.boolean().default(false),
  nocache: Joi.boolean().default(false),
  quick: Joi.boolean().default(false),
  extraInfo: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  // handle the ids
  ctx.params.ids = ctx.params.id.split(',')
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  params.realIP = ctx.get('X-Real-IP') ?? null
  ctx.body = await getSummery(params, !params.quick, params.realIP)
  ctx.status = ctx.body.code = 200
  ctx.body.message = 'ok'
}

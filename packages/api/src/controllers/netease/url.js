// This module is intended to get the play url of ncm songs
const Joi = require('joi')
const { getSongsURLs } = require('./_sdk_song_wrapper')

// validation schema
const { ValidateParams } = require('../../utils/response')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  id: Joi.string(),
  ids: Joi.array().items(Joi.number().min(1).max(1000000000000000)).required(),
  br: Joi.number().valid(999000, 320000, 128000).default(320000), // flac, 320k, 128k
})

module.exports = async (ctx) => {
  // handle the ids
  ctx.params.ids = ctx.params.id.split(',')
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  let data
  try {
    data = await getSongsURLs(params.id, ctx.get('X-Real-IP'), params.br)
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

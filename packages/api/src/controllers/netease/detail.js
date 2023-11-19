// This module is intended to get song details
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getSongsDetailWithCache } = require('./_sdk_song_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  id: Joi.string(),
  ids: Joi.array().items(Joi.number().min(1).max(1000000000000000)).required(),
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  // handle the ids
  ctx.params.ids = ctx.params.id.split(',')
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { id, nocache } = params
  let data
  try {
    data = await getSongsDetailWithCache(id, ctx.get('X-Real-IP'), nocache)
  } catch (error) {
    data = recoverRequest(error)
  }
  ctx.status = 200
  ctx.body = data
}

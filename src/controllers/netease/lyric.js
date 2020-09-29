// This module is intended to get album details
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getLyric, getLyricWithCache } = require('./_sdk_song_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { id, nocache } = params
  let data
  try {
    data = await (nocache
      ? getLyric(id, ctx.get('X-Real-IP'))
      : getLyricWithCache(id, ctx.get('X-Real-IP')))
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

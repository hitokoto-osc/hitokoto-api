// This module is intended to get DJ details
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getDJDetailWithCache } = require('./_sdk_dj_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  rid: Joi.number().min(1).max(1000000000000).required(),
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { rid, nocache } = params
  let data
  try {
    data = await getDJDetailWithCache(rid, ctx.get('X-Real-IP'), nocache)
  } catch (error) {
    data = recoverRequest(error)
  }
  ctx.status = 200
  ctx.body = data
}

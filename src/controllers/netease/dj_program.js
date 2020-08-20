// This module is intended to get DJ Program details
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getDJProgram, getDJProgramWithCache } = require('./_sdk_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  rid: Joi.number().min(1).max(1000000000000).required(),
  limit: Joi.number().min(1).max(10000).default(30),
  offset: Joi.number().min(0).default(0),
  asc: Joi.boolean().default(false),
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { rid, limit, offset, asc, nocache } = params
  let data
  try {
    data = await (nocache
      ? getDJProgram(rid, limit, offset, asc, ctx.get('X-Real-IP'))
      : getDJProgramWithCache(rid, limit, offset, asc, ctx.get('X-Real-IP')))
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

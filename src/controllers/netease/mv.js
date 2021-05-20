// This module is intended to get MV Detail
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getMVDetailWithCache } = require('./_sdk_mv_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  mvid: Joi.number().min(1).max(1000000000000).required(),
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { mvid, nocache } = params
  let data
  try {
    data = await getMVDetailWithCache(mvid, ctx.get('X-Real-IP'), nocache)
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

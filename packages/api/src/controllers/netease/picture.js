// This module is intended to get picture url
const Joi = require('joi')
const { getPictureURL } = require('./_sdk_wrapper')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.string().required(),
  height: Joi.number().default(300),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const pictureURL = getPictureURL(params.id, params.height)
  ctx.body = {
    url: pictureURL,
  }
}

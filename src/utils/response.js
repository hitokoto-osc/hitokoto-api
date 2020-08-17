// import modules
// const Joi = require('joi')

module.exports.ValidateParams = async (rawObject, schema, ctx) => {
  try {
    await schema.validateAsync(rawObject)
    return true
  } catch (err) {
    ctx.badRequest({
      status: 400,
      message: '请求参数错误',
      data: {
        raw_data: err._original,
        details: err.details
      },
      ts: Date.now()
    })
    return false
  }
}

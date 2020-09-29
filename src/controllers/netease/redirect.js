// This module is intended to redirect the ncm path
const Joi = require('joi')
const _ = require('lodash')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getSongsURLs } = require('./_sdk_song_wrapper')
const schema = Joi.object({
  id: Joi.number().integer().min(1).max(1000000000000000).required(), // the max number is intended to prevent the Number(int) overflow
  br: Joi.number().valid(999000, 320000, 128000).default(320000), // flac, 320k, 128k
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { id, br } = params
  try {
    const body = await getSongsURLs(id, br, ctx.get('X-Real-IP'))
    ctx.status = 302
    ctx.redirect(
      body.data[0].url.replace(/http:\/\/m(\d+)[a-zA-Z]*/, 'https://m$1'),
    )
  } catch (err) {
    ctx.status = 500
    ctx.body = {
      status: _.get(err, 'detail.responseBody.code', 500),
      message: '获取地址时触发错误',
      data: {
        error: {
          msg: err.message,
          type: err.type,
          detail: err.detail,
        },
      },
    }
  }
}

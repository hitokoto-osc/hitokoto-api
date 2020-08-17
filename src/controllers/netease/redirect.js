// This module is intended to redirect the ncm path
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')

// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().integer().min(1).max(1000000000000000).required(), // the max number is intended to prevent the Number(int) overflow
  br: Joi.number().valid(999000, 320000, 128000).default(320000) // flac, 320k, 128k
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!await ValidateParams(params, schema, ctx)) { // validateParams
    return
  }
  const result = await sdk.song_url({
    id: ctx.params.id,
    realIP: ctx.get('X-Real-IP'),
    br: params.brs
  })
  winston.verbose(result)
  if (result.status !== 200) {
    ctx.status = Number.parseInt(result.status)
    ctx.body = {
      status: result.status,
      message: '上游错误',
      data: result.body,
      ts: Date.now()
    }
    return
  } else if (
    Number.parseInt(result.body.code) !== 200 ||
    result.body.data.length === 0 ||
    !result.body.data[0].url
  ) {
    const statusCode = Number.parseInt(result.body.code)
    ctx.status = statusCode !== 200 ? statusCode : 400
    ctx.body = {
      status: Number.parseInt(ctx.status),
      message: ctx.status === 400 ? '无法获取歌曲地址' : '上游错误',
      data: result.body,
      ts: Date.now()
    }
    return
  }

  ctx.status = 302
  ctx.redirect(result.body.data[0].url.replace(/http:\/\/m(\d+)[a-zA-Z]*/, 'https://m$1'))
}

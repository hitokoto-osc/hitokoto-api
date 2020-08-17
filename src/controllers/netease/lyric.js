// This module is intended to get album details
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required()
})

async function getLyric (params, ctx) {
  const {
    id
  } = params
  const result = await sdk.lyric({
    id,
    realIP: ctx.get('X-Real-IP')
  })
  if (result.status !== 200) {
    ctx.body = {
      status: result.status,
      message: '上游错误',
      data: result.body,
      ts: Date.now()
    }
    return
  }
  return result.body
}

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!await ValidateParams(params, schema, ctx)) { // validateParams
    return
  }
  const data = await (params.nocache ? getLyric(params, ctx) : Cache.remeber(
    `nm:lyric:${params.id}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getLyric(params, ctx)
    }
  ))
  winston.verbose(data)
  if (data.code !== 200) {
    ctx.status = Number.parseInt(data.code)
    ctx.body = {
      status: data.code,
      message: '上游错误',
      data: data,
      ts: Date.now()
    }
    return
  }
  ctx.status = 200
  ctx.body = data
}

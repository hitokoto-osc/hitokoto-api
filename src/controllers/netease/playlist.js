// This module is intended to search songs
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
  s: Joi.number().min(1).max(10000).default(8),
  nocache: Joi.boolean().default(false)
})

async function getPlaylistDetail (params, ctx) {
  const {
    id,
    s
  } = params
  const result = await sdk.playlist_detail({
    id,
    s,
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
  const data = await (params.nocache ? getPlaylistDetail(params, ctx) : Cache.remeber(
    `nm:playlist:${params.id}`,
    60 * 60 * 2, // 2 Hours
    async () => {
      return getPlaylistDetail(params, ctx)
    }
  ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

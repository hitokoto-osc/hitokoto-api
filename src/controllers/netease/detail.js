// This module is intended to get song details
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.string(),
  ids: Joi.array().items(Joi.number().min(1).max(1000000000000000)).required(),
})

async function getSongDetail(params, ctx) {
  const { id } = params
  const result = await sdk.song_detail({
    ids: id,
    realIP: ctx.get('X-Real-IP'),
  })
  if (result.status !== 200) {
    ctx.body = {
      status: result.status,
      message: '上游错误',
      data: result.body,
      ts: Date.now(),
    }
    return
  }
  return result.body
}

module.exports = async (ctx) => {
  // handle the ids
  ctx.params.ids = ctx.params.id.split(',')
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const data = await (params.nocache
    ? getSongDetail(params, ctx)
    : Cache.remeber(
        `nm:detail:${params.id}`,
        60 * 60 * 2, // 2 Hours
        async () => {
          return getSongDetail(params, ctx)
        },
      ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

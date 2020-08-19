// This module is intended to search songs
const winston = require('winston')
const sdk = require('NeteaseCloudMusicApi')
const Joi = require('joi')
const Cache = require('../../cache')
const { md5 } = require('../../utils/crypto')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  keyword: Joi.string().min(1).max(10000).required(),
  limit: Joi.number().min(1).max(10000).default(30),
  offset: Joi.number().min(0).default(0),
  type: Joi.string()
    .uppercase()
    .valid(
      'ALBUM',
      'ARTIST',
      'DJ',
      'LYRIC',
      'MV',
      'PLAYLIST',
      'SONG',
      'USER',
      'VIDEO',
      'COMPLEX',
    )
    .default('SONG'),
  nocache: Joi.boolean().default(false),
})

async function getSearchDetail(params, ctx) {
  const { keyword, limit, offset, type } = params
  const result = await sdk.search({
    keywords: keyword,
    limit,
    offset,
    type: typeMap[type],
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
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const data = await (params.nocache
    ? getSearchDetail(params, ctx)
    : Cache.remeber(
        `nm:search:${md5(params.keyword)}:${params.limit}:${params.offset}:${
          params.type
        }`,
        60 * 60 * 2, // 2 Hours
        async () => {
          return getSearchDetail(params, ctx)
        },
      ))
  winston.verbose(data)
  ctx.status = 200
  ctx.body = data
}

const typeMap = {
  SONG: 1,
  ALBUM: 10,
  ARTIST: 100,
  PLAYLIST: 1000,
  USER: 1002,
  MV: 1004,
  LYRIC: 1006,
  DJ: 1009,
  VIDEO: 1014,
  COMPLEX: 1018,
}

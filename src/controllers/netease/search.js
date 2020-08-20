// This module is intended to search songs
const winston = require('winston')
const Joi = require('joi')
const { search, searchWithCache } = require('./_sdk_wrapper')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { recoverRequest } = require('./_sdk_utils')
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

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { keyword, limit, offset, type, nocache } = params
  let data
  try {
    data = await (nocache
      ? search(keyword, limit, offset, typeMap[type], ctx.get('X-Real-IP'))
      : searchWithCache(
          keyword,
          limit,
          offset,
          typeMap[type],
          ctx.get('X-Real-IP'),
        ))
  } catch (err) {
    data = recoverRequest(err)
  }
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

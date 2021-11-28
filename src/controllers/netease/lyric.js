// This module is intended to get album details
const Joi = require('joi')
// validation schema
const { ValidateParams } = require('../../utils/response')
const { getLyricWithCache } = require('./_sdk_song_wrapper')
const { recoverRequest } = require('./_sdk_utils')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
  pure: Joi.boolean().default(false),
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { id, nocache, pure } = params
  let data
  try {
    data = await getLyricWithCache(id, ctx.get('X-Real-IP'), nocache)
    if (pure) data = data?.lrc?.lyric ?? '[99:00.00]本音乐暂无歌词哦~\n'
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

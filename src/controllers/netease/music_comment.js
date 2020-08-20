// This module is intended to get song comments
const Joi = require('joi')
const { getSongComment, getSongsDetailWithCache } = require('./_sdk_wrapper')
const { recoverRequest } = require('./_sdk_utils')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.number().min(1).max(1000000000000).required(),
  limit: Joi.number().min(1).max(10000).default(20),
  offset: Joi.number().min(0).default(0),
  before: Joi.number(), // 分页参数，取上一页最后一项的 time 获取下一页数据(获取超过5000条评论的时候需要用到)
  nocache: Joi.boolean().default(false),
})

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!(await ValidateParams(params, schema, ctx))) {
    // validateParams
    return
  }
  const { nocache, id, limit, offset, before } = params
  let data
  try {
    data = await (nocache
      ? getSongComment(id, limit, offset, before, ctx.get('X-Real-IP'))
      : getSongsDetailWithCache(
          id,
          limit,
          offset,
          before,
          ctx.get('X-Real-IP'),
        ))
  } catch (err) {
    data = recoverRequest(err)
  }
  ctx.status = 200
  ctx.body = data
}

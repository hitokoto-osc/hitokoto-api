const {
  excludeNotMatchCategories,
  fail,
  getParamEncode,
  getParamCategory,
  getRandomSentenceIDWithSpecificCategory,
  getSentenceByUUID,
  tickUpdateCategories,
  ok,
} = require('./_utils')

module.exports = async (ctx) => {
  // Tick Updates
  await tickUpdateCategories()
  if (!ctx.query) {
    throw new Error('Runtime Error: `ctx.query` is not defined.')
  }
  // Query Params
  const tmp = {
    max: parseInt(ctx.query.max_length),
    min: parseInt(ctx.query.min_length),
  }
  const params = {
    c: getParamCategory(ctx.query.c),
    encode: getParamEncode(ctx.query.encode),
    select: ctx.query.select ?? '.hitokoto',
  }
  params.min_length = tmp.min && tmp.min >= 0 ? tmp.min : 0
  params.max_length =
    tmp.max && tmp.max <= 1000 && tmp.max > params.min_length
      ? parseInt(ctx.query.max_length)
      : 30
  // 检查句子长度配置
  if (params.max_length < params.min_length) {
    return fail(ctx, '`max_length` 不能小于 `min_length`！', 400)
  }
  // 排除无效分类
  params.c = excludeNotMatchCategories(
    params.min_length,
    params.max_length,
    params.c,
  )
  if (params.c.length <= 0) {
    return fail(ctx, '很抱歉，没有分类有句子符合长度区间。', 400)
  }
  // TODO: 据反映，此种做法可能使句子偏少的分类出现较高重复率，应该讨论改进的方法
  const category = params.c[Math.floor(Math.random() * params.c.length)]
  const sentenceUUIDList = await getRandomSentenceIDWithSpecificCategory(
    params.min_length,
    params.max_length,
    category,
  ) // 从有效的分类中返回符合长度的句子标识
  if (sentenceUUIDList.length === 0) {
    return fail(ctx, '很抱歉，没有句子符合长度区间。', 400)
  }
  const sentence = await getSentenceByUUID(sentenceUUIDList) // 从满足长度区间的 UUID 列表中抽一个
  ok(ctx, sentence, params.encode, params.select)
}

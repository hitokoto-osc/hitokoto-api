// Import necessary packages
const path = require('path')
const SrcDir = path.join('../../', './src/')
const db = require(SrcDir + 'db')

async function hitokoto (ctx, next) {
  // Connect Database
  const hitokoto = await db.registerModel('hitokoto')
  if (ctx.query && ctx.query.c) {
    // exist params c
    const ret = await hitokoto.findOne({
      where: {
        type: ctx.query.c
      },
      attributes: { exclude: ['from_who', 'creator_uid', 'assessor', 'owner'] },
      order: db.sequelize.random()
    })
    // CheckEncoding
    // console.log(ctx.query)
    const encode = !!(ctx.query.encode && ctx.query.encode === 'text')
    if (encode) {
      if (ret) {
        ctx.status = 200
        ctx.body = ret.hitokoto
      } else {
        ctx.body = '很抱歉，该分类下尚无条目'
      }
    } else {
      if (ret) {
        ctx.status = 200
        ctx.body = ret
      } else {
        ctx.body = {
          message: '很抱歉，该分类下尚无条目',
          status: '404'
        }
      }
    }
  } else {
    // Not Params or just has callback
    const ret = await hitokoto.findOne({
      attributes: { exclude: ['from_who', 'creator_uid', 'assessor', 'owner'] },
      order: db.sequelize.random()
    })

    // Check Encoding
    const encode = !!(ctx.query && ctx.query.encode && ctx.query.encode === 'text')
    if (encode) {
      ctx.status = 200
      ctx.body = ret.hitokoto
    } else {
      ctx.status = 200
      ctx.body = ret
    }
  }
}

module.exports = hitokoto

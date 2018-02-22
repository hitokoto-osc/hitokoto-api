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
    if (!ret) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，该分类下尚无条目'
      }
      return
    }
    // CheckEncoding
    const encode = ctx.query.encode
    switch (encode) {
      case 'json':
        ctx.body = ret
        break
      case 'text':
        ctx.body = ret.text
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        ctx.set('charset', 'utf-8')
        ctx.set('Content-Type', 'text/javascript')
        ctx.body = `(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        break
      default:
        ctx.body = ret
        break
    }
  } else {
    // Not Params or just has callback
    const ret = await hitokoto.findOne({
      attributes: { exclude: ['from_who', 'creator_uid', 'assessor', 'owner'] },
      order: db.sequelize.random()
    })

    // CheckEncoding
    const encode = ctx.query.encode
    switch (encode) {
      case 'json':
        ctx.body = ret
        break
      case 'text':
        ctx.body = ret.text
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        ctx.set('charset', 'utf-8')
        ctx.set('Content-Type', 'text/javascript')
        ctx.body = `(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');if(!dom){console.error("请输入正确的选择器值");}Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        break
      default:
        ctx.body = ret
        break
    }
  }
}
module.exports = hitokoto

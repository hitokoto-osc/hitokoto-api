// Import necessary packages
const iconv = require('iconv-lite')
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
      attributes: {
        exclude: ['from_who', 'creator_uid', 'assessor', 'owner']
      },
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
    const gbk = (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') ? !!'gbk' : false
    switch (encode) {
      case 'json':
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(ret), 'GBK')
        } else {
          ctx.body = ret
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(ret.hitokoto, 'GBK')
        }
        ctx.body = ret.hitokoto
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        if (gbk) {
          ctx.set('Content-Type', 'text/javascript; charset=gbk')
          ctx.body = iconv.encode(response, 'GBK')
        } else {
          ctx.set('Content-Type', 'text/javascript; charset=utf-8')
          ctx.body = response
        }
        break
      default:
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(ret), 'GBK')
        } else {
          ctx.body = ret
        }
        break
    }
  } else {
    // Not Params or just has callback
    const ret = await hitokoto.findOne({
      attributes: {
        exclude: ['from_who', 'creator_uid', 'assessor', 'owner']
      },
      order: db.sequelize.random()
    })

    // CheckEncoding
    const encode = ctx.query.encode
    const gbk = (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') ? !!'gbk' : false
    switch (encode) {
      case 'json':
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(ret), 'GBK')
        } else {
          ctx.body = ret
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(ret.hitokoto, 'GBK')
        }
        ctx.body = ret.hitokoto
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        if (gbk) {
          ctx.set('Content-Type', 'text/javascript; charset=gbk')
          ctx.body = iconv.encode(response, 'GBK')
        } else {
          ctx.set('Content-Type', 'text/javascript; charset=utf-8')
          ctx.body = response
        }
        break
      default:
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(ret), 'GBK')
        } else {
          ctx.body = ret
        }
        break
    }
  }
}
module.exports = hitokoto

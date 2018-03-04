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
    let response
    let js = false
    switch (encode) {
      case 'json':
        response = Buffer.from(JSON.stringify(ret))
        break
      case 'text':
        response = Buffer.from(ret.text)
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        // ctx.set('Content-Type', 'text/javascript; charset=utf-8')
        js = true
        response = Buffer.from(`(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`)
        break
      default:
        response = Buffer.from(JSON.stringify(ret))
        break
    }
    if (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') {
      if (js) {
        ctx.set('Content-Type', 'text/javascript; charset=gbk')
      } else {
        ctx.set('Content-Type', 'application/json; charset=gbk')
      }
      ctx.body = iconv.encode(response, 'GBK')
    } else {
      if (js) {
        ctx.set('Content-Type', 'text/javascript; charset=utf-8')
      } else {
        ctx.set('Content-Type', 'application/json; charset=utf-8')
      }
      ctx.body = response
    }
  } else {
    // Not Params or just has callback
    const ret = await hitokoto.findOne({
      attributes: { exclude: ['from_who', 'creator_uid', 'assessor', 'owner'] },
      order: db.sequelize.random()
    })

    // CheckEncoding
    const encode = ctx.query.encode
    let response
    let js = false
    switch (encode) {
      case 'json':
        response = Buffer.from(JSON.stringify(ret))
        break
      case 'text':
        response = Buffer.from(ret.text)
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        // ctx.set('Content-Type', 'text/javascript; charset=utf-8')
        js = true
        response = Buffer.from(`(function hitokoto(){var hitokoto="${ret.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`)
        break
      default:
        response = Buffer.from(JSON.stringify(ret))
        break
    }
    if (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') {
      if (js) {
        ctx.set('Content-Type', 'text/javascript; charset=gbk')
      } else {
        ctx.set('Content-Type', 'application/json; charset=gbk')
      }
      ctx.body = iconv.encode(response, 'GBK')
    } else {
      if (js) {
        ctx.set('Content-Type', 'text/javascript; charset=utf-8')
      } else {
        ctx.set('Content-Type', 'application/json; charset=utf-8')
      }
      ctx.body = response
    }
  }
}
module.exports = hitokoto

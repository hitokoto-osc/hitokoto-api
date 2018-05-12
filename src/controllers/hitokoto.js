// Import necessary packages
const iconv = require('iconv-lite')
const path = require('path')
const SrcDir = path.join('../../', './src/')
const db = require(SrcDir + 'db')
let Hitokoto
let updateLock = false
function sleep (sec) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, sec * 1000)
  })
}

async function syncHitokotoList () {
  if (updateLock) {
    for (let loop = 1; loop <= 4; loop++) {
      await sleep(0.5)
      if (Hitokoto) {
        return
      }
    }
  }
  updateLock = true
  const result = {}
  const hitokoto = await db.registerModel('hitokoto')
  // Fetch All Data
  result.all = await hitokoto.findAll({
    attributes: {
      exclude: ['from_who', 'creator_uid', 'assessor', 'owner']
    }
  })
  // Generate Categroy List
  result.categroy = {}
  for (let sentence of result.all) {
    if (!result.categroy[sentence.type]) {
      // Init Categroy List
      result.categroy[sentence.type] = []
    }
    result.categroy[sentence.type].push(sentence)
  }
  // fill TS
  result.lastUpdate = Date.now()
  // Update Data
  Hitokoto = result

  updateLock = false
}
async function hitokoto (ctx, next) {
  // judge whether data is exist
  if (!Hitokoto) {
    // Sync Data
    await syncHitokotoList()
  } else if ((Date.now() - Hitokoto.lastUpdate) > 1000 * 60 * 60 * 2) {
    // Data is outdate. async update.
    syncHitokotoList()
  }
  if (ctx.query && ctx.query.c) {
    // exist params c
    if (!Hitokoto.categroy[ctx.query.c]) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，该分类下尚无条目'
      }
      return
    }
    // Random Sentence
    const sentence = Hitokoto.categroy[ctx.query.c][Math.floor(Math.random() * Hitokoto.categroy[ctx.query.c].length)]
    // CheckEncoding
    const encode = ctx.query.encode
    const gbk = (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') ? !!'gbk' : false
    switch (encode) {
      case 'json':
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(sentence), 'GBK')
        } else {
          ctx.body = sentence
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(sentence.hitokoto, 'GBK')
        }
        ctx.body = sentence.hitokoto
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto="${sentence.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
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
          ctx.body = iconv.encode(JSON.stringify(sentence), 'GBK')
        } else {
          ctx.body = sentence
        }
        break
    }
  } else {
    // Not Params or just has callback
    // Random Sentence
    const sentence = Hitokoto.all[Math.floor(Math.random() * Hitokoto.all.length)]
    // CheckEncoding
    const encode = ctx.query.encode
    const gbk = (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') ? !!'gbk' : false
    switch (encode) {
      case 'json':
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(JSON.stringify(sentence), 'GBK')
        } else {
          ctx.body = sentence
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(sentence.hitokoto, 'GBK')
        }
        ctx.body = sentence.hitokoto
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto="${sentence.hitokoto}";var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
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
          ctx.body = iconv.encode(JSON.stringify(sentence), 'GBK')
        } else {
          ctx.body = sentence
        }
        break
    }
  }
}
module.exports = hitokoto

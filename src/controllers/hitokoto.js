// Import necessary packages
const iconv = require('iconv-lite')
const path = require('path')
const SrcDir = path.join('../../', './src/')
const db = require(SrcDir + 'db')
const fastJson = require('fast-json-stringify')
const flatstr = require('flatstr')

// define fastJson scheme
const hitokotoFormat = fastJson({
  title: 'hitokoto',
  type: 'object',
  properties: {
    id: { type: 'integer' },
    hitokoto: { type: 'string' },
    type: { type: 'string' },
    from: { type: 'string' },
    from_who: { type: 'string', 'nullable': true },
    creator: { type: 'string' },
    creator_uid: { type: 'integer' },
    reviewer: { type: 'integer' },
    uuid: { type: 'string' },
    created_at: { type: 'string' }
  }
})
const rawString = fastJson({
  title: 'rawString',
  type: 'string'
})

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
      exclude: ['assessor', 'owner']
    }
  })
  // Generate Categroy List
  result.categroy = {}
  const categroy = []
  for (let sentence of result.all) {
    if (!result.categroy[sentence.type]) {
      // Init Categroy List
      result.categroy[sentence.type] = []
      categroy.push(sentence.type)
    }
    result.categroy[sentence.type].push(sentence)
  }
  // fill TS
  result.lastUpdate = Date.now()

  // let Status know
  global.hitokoto = {}
  global.hitokoto.total = result.all.length
  global.hitokoto.categroy = categroy
  global.hitokoto.lastUpdated = result.lastUpdate

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
    let categroy = ctx.query.c

    // support ?c=a&c=b&c=d
    if (Array.isArray(categroy) && categroy.length > 0) {
      categroy = categroy[Math.floor(Math.random() * categroy.length)]
    }

    if (!Hitokoto.categroy[categroy]) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，该分类下尚无条目'
      }
      return
    }
    // Random Sentence
    const sentence = Hitokoto.categroy[categroy][Math.floor(Math.random() * Hitokoto.categroy[categroy].length)]
    // CheckEncoding
    const encode = ctx.query.encode
    const gbk = (ctx.query && ctx.query.charset && ctx.query.charset.toLocaleLowerCase() === 'gbk') ? !!'gbk' : false
    switch (encode) {
      case 'json':
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(hitokotoFormat(sentence), 'GBK')
        } else {
          ctx.body = flatstr(hitokotoFormat(sentence))
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(sentence.hitokoto, 'GBK')
          return
        }
        ctx.body = flatstr(sentence.hitokoto)
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto=${rawString(sentence.hitokoto)};var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        if (gbk) {
          ctx.set('Content-Type', 'text/javascript; charset=gbk')
          ctx.body = iconv.encode(response, 'GBK')
        } else {
          ctx.set('Content-Type', 'text/javascript; charset=utf-8')
          ctx.body = flatstr(response)
        }
        break
      default:
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(hitokotoFormat(sentence), 'GBK')
        } else {
          ctx.body = flatstr(hitokotoFormat(sentence))
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
          ctx.body = iconv.encode(hitokotoFormat(sentence), 'GBK')
        } else {
          ctx.body = flatstr(hitokotoFormat(sentence))
        }
        break
      case 'text':
        if (gbk) {
          ctx.set('Content-Type', 'text/plain; charset=gbk')
          ctx.body = iconv.encode(sentence.hitokoto, 'GBK')
        }
        ctx.body = flatstr(sentence.hitokoto)
        break
      case 'js':
        const select = ctx.query.select ? ctx.query.select : '.hitokoto'
        const response = `(function hitokoto(){var hitokoto=${rawString(sentence.hitokoto)};var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
        if (gbk) {
          ctx.set('Content-Type', 'text/javascript; charset=gbk')
          ctx.body = iconv.encode(response, 'GBK')
        } else {
          ctx.set('Content-Type', 'text/javascript; charset=utf-8')
          ctx.body = flatstr(response)
        }
        break
      default:
        if (gbk) {
          ctx.set('Content-Type', 'application/json; charset=gbk')
          ctx.body = iconv.encode(hitokotoFormat(sentence), 'GBK')
        } else {
          ctx.body = flatstr(hitokotoFormat(sentence))
        }
        break
    }
  }
}
module.exports = hitokoto

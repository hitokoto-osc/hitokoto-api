// Import necessary packages
const fastJson = require('fast-json-stringify')
const cache = require('../cache')

// define fastJson scheme
const rawString = fastJson({
  title: 'rawString',
  type: 'string'
})
const categories = {
  collection: [],
  lastupdated: 0,
  updateLock: false
}

async function hitokoto (ctx, next) {
  // check categories
  if (!categories.updateLock && (categories.lastupdated === 0 || (Date.now() - categories.lastupdated) >= 1000 * 60 * 90)) {
    try {
      categories.updateLock = true
      const tmp = await cache.get('hitokoto:bundle:categories')
      for (const categroy of tmp) {
        categories.collection.push(categroy.key)
      }
      categories.lastupdated = Date.now()
      categories.updateLock = false
    } catch (e) {
      categories.updateLock = false
      throw e
    }
  }
  let sentence = ''
  if (ctx.query && ctx.query.c) {
    // exist params c
    let categroy = ctx.query.c
    // support ?c=a&c=b&c=d
    if (Array.isArray(categroy) && categroy.length > 0) {
      categroy = categroy[Math.floor(Math.random() * categroy.length)]
    }
    if (!categories.collection.includes(categroy)) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，此分类不存在。'
      }
      return
    }
    // parse length
    const minLength = ctx.query.min_length || 0
    const maxLength = ctx.query.max_length && ctx.query.max_length <= 1000 && ctx.query.max_length > minLength ? ctx.query.max_length : 30
    // get hitokoto sentences id
    const client = cache.getClient()
    const uuids = await client.zrangebyscoreAsync('hitokoto:bundle:category:' + categroy, minLength, maxLength)
    if (uuids.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有句子符合长度区间。'
      }
      return
    }
    // Random Sentence
    sentence = await cache.get('hitokoto:sentence:' + uuids[Math.floor(Math.random() * uuids.length)], false)
    // CheckEncoding
  } else {
    // Not Params or just has callback
    const categroy = categories.collection[Math.floor(Math.random() * categories.collection.length)]
    console.log(categroy)
    // parse length
    const minLength = ctx.query.min_length || 0
    const maxLength = ctx.query.max_length && ctx.query.max_length <= 1000 && ctx.query.max_length > minLength ? ctx.query.max_length : 30
    // get hitokoto sentences id
    const client = cache.getClient()
    const uuids = await client.zrangebyscoreAsync('hitokoto:bundle:category:' + categroy, minLength, maxLength)
    if (uuids.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有句子符合长度区间。'
      }
      return
    }
    // Random Sentence
    sentence = await cache.get('hitokoto:sentence:' + uuids[Math.floor(Math.random() * uuids.length)], false)
  }
  const encode = ctx.query.encode
  switch (encode) {
    case 'json':
      ctx.type = 'application/json'
      ctx.body = sentence
      break
    case 'text':
      ctx.type = 'text/plain'
      ctx.body = sentence.hitokoto
      break
    case 'js':
      const select = ctx.query.select ? ctx.query.select : '.hitokoto'
      const response = `(function hitokoto(){var hitokoto=${rawString(sentence.hitokoto)};var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
      ctx.type = 'text/javascript'
      ctx.body = response
      break
    default:
      ctx.type = 'application/json'
      ctx.body = sentence
      break
  }
}
module.exports = hitokoto

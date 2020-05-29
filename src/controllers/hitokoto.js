// Import necessary packages
const fastJson = require('fast-json-stringify')
// const cache = require('../cache')
const AB = require('../extensions/sentencesABSwitcher')
// define fastJson scheme
const rawString = fastJson({
  title: 'rawString',
  type: 'string'
})
const categories = {
  collection: [],
  lastupdated: 0,
  updateLock: false,
  lengthRange: {}
}

async function updateCategories () {
  try {
    categories.updateLock = true
    const tmp = await AB.get('hitokoto:bundle:categories')
    for (const category of tmp) {
      const [maxLength, minLength] = await Promise.all([
        AB.get(`hitokoto:bundle:category:${category.key}:max`),
        AB.get(`hitokoto:bundle:category:${category.key}:min`)
      ])
      categories.collection.push(category.key)
      if (!categories.lengthRange[category.key]) {
        categories.lengthRange[category.key] = {}
      }
      categories.lengthRange[category.key].max = maxLength
      categories.lengthRange[category.key].min = minLength
    }
    categories.lastupdated = Date.now()
    categories.updateLock = false
  } catch (e) {
    categories.updateLock = false
    throw e
  }
}

function excludeNotMatchCategories (ctx, minLength, maxLength, cats = []) {
  const targetCategories = []
  if (cats.length === 0) {
    cats = categories.collection
  }
  for (const cat of cats) {
    if (!categories.lengthRange[cat]) {
      continue // skip invalid cats
    }
    if (minLength <= categories.lengthRange[cat].max && maxLength >= categories.lengthRange[cat].min) {
      targetCategories.push(cat)
    }
  }
  return targetCategories
}

async function hitokoto (ctx, next) {
  // check categories
  if (!categories.updateLock && categories.lastupdated === 0) {
    await updateCategories()
  }
  if (!categories.updateLock && (Date.now() - categories.lastupdated) >= 1000 * 60 * 90) {
    updateCategories()
  }
  let sentence = ''
  if (ctx.query && ctx.query.c) {
    // exist params c
    let category = ctx.query.c // support ?c=a&c=b&c=d
    // parse length
    const minLength = ctx.query.min_length || 0
    const maxLength = ctx.query.max_length && ctx.query.max_length <= 1000 && ctx.query.max_length > minLength ? ctx.query.max_length : 30
    if (maxLength < minLength) {
      ctx.status = 400
      ctx.body = {
        status: 400,
        message: '很抱歉，`max_length` 不能小于 `min_length`！'
      }
      return
    }
    // process array
    // exclude the category that is out of range
    const targetCategories = excludeNotMatchCategories(ctx, minLength, maxLength, Array.isArray(category) ? category : [category])
    if (targetCategories.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有分类有句子符合长度区间。'
      }
      return
    }
    category = targetCategories[Math.floor(Math.random() * targetCategories.length)]
    // get hitokoto sentences id
    const client = AB.getClient()
    const uuids = await client.zrangebyscoreAsync('hitokoto:bundle:category:' + category, minLength, maxLength)
    if (uuids.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有句子符合长度区间。'
      }
      return
    }
    // Random Sentence
    sentence = await AB.get('hitokoto:sentence:' + uuids[Math.floor(Math.random() * uuids.length)], false)
    // CheckEncoding
  } else {
    // Not Params or just has callback
    // parse length
    const minLength = ctx.query.min_length || 0
    const maxLength = ctx.query.max_length && ctx.query.max_length <= 1000 && ctx.query.max_length > minLength ? ctx.query.max_length : 30
    if (maxLength < minLength) {
      ctx.status = 400
      ctx.body = {
        status: 400,
        message: '很抱歉，`max_length` 不能小于 `min_length`！'
      }
      return
    }
    // exclude the category that is out of range
    const targetCategories = excludeNotMatchCategories(ctx, minLength, maxLength)
    if (targetCategories.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有分类有句子符合长度区间。'
      }
      return
    }
    const category = targetCategories[Math.floor(Math.random() * targetCategories.length)]
    // get hitokoto sentences id
    const client = AB.getClient()
    const uuids = await client.zrangebyscoreAsync('hitokoto:bundle:category:' + category, minLength, maxLength)
    if (uuids.length === 0) {
      ctx.status = 404
      ctx.body = {
        status: 404,
        message: '很抱歉，没有句子符合长度区间。'
      }
      return
    }
    // Random Sentence
    sentence = await AB.get('hitokoto:sentence:' + uuids[Math.floor(Math.random() * uuids.length)], false)
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

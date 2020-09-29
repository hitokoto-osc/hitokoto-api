const AB = require('../../extensions/sentencesABSwitcher')
const winston = require('winston')
const flatstr = require('flatstr')

module.exports = exports = {}
// TODO: 暂时写死一些常量，以后改作动态更新
const allowedEncode = new Set(['json', 'js', 'text'])
const MIME = new Map([
  ['json', 'application/json'],
  ['js', 'application/javascript'],
  ['text', 'text/plain'],
])

const categories = {
  collection: new Set(),
  lastUpdated: 0,
  updateLock: false,
  lengthRange: new Map(),
}

exports.getCategoriesList = () => Array.from(categories.collection)

exports.getParamEncode = (encode) => {
  const tmp = encode ?? 'json'
  return allowedEncode.has(tmp) ? tmp : 'json'
}

exports.getParamCategory = (c) => {
  if (!c) {
    return []
  } else if (!Array.isArray(c)) {
    c = [c]
  }
  return c
}

exports.getSentenceByUUID = async (sentenceUUIDList) => {
  return AB.get(
    'hitokoto:sentence:' +
      sentenceUUIDList[Math.floor(Math.random() * sentenceUUIDList.length)],
    false,
  )
}

exports.excludeNotMatchCategories = (minLength, maxLength, cats = []) => {
  const targetCategories = []
  if (cats.length === 0) {
    cats = exports.getCategoriesList(categories.collection) // convert Set to Array
  }
  for (const cat of cats) {
    if (!categories.lengthRange.has(cat)) {
      continue // skip invalid cats
    }
    if (
      minLength <= categories.lengthRange.get(cat).get('max') &&
      maxLength >= categories.lengthRange.get(cat).get('min')
    ) {
      targetCategories.push(cat)
    }
  }
  return targetCategories
}

exports.getRandomSentenceIDWithSpecificCategory = async (
  minLength,
  maxLength,
  category,
) => {
  const client = AB.getClient()
  return client.zrangebyscore(
    'hitokoto:bundle:category:' + category,
    minLength,
    maxLength,
  )
}

async function updateCategories() {
  try {
    categories.updateLock = true
    const tmp = await AB.get('hitokoto:bundle:categories')
    for (const category of tmp) {
      const [maxLength, minLength] = await Promise.all([
        AB.get(`hitokoto:bundle:category:${category.key}:max`),
        AB.get(`hitokoto:bundle:category:${category.key}:min`),
      ])
      categories.collection.add(category.key)
      categories.lengthRange.set(
        category.key,
        new Map([
          ['max', maxLength],
          ['min', minLength],
        ]),
      )
    }
    categories.lastUpdated = Date.now()
    categories.updateLock = false
  } catch (e) {
    categories.updateLock = false
    winston.error(
      '[hitokoto.updateCategories] occur error while updating, error details:',
    )
    winston.error(e)
    // throw e
  }
}

exports.tickUpdateCategories = async () => {
  if (!categories.updateLock && categories.lastUpdated === 0) {
    return await updateCategories()
  }
  if (
    !categories.updateLock &&
    Date.now() - categories.lastUpdated >= 1000 * 60 * 90 // 1 H 30 Min
  ) {
    updateCategories()
  }
}

exports.fail = (ctx, msg, code) => {
  ctx.status = code > 0 ? code : 200
  ctx.body = {
    status: code,
    message: msg,
    data: [],
    ts: Date.now(),
  }
}

exports.ok = (ctx, data, type, select = '.hitokoto') => {
  ctx.status = 200
  ctx.body = flatstr(handleData[type](data, select))
  ctx.type = MIME.get(type)
}

const handleData = {
  json: (data) => data,
  js: (data, select) => {
    data = JSON.parse(data)
    return `(function hitokoto(){var hitokoto=${JSON.stringify(
      data.hitokoto,
    )};var dom=document.querySelector('${select}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`
  },
  text: (data) => {
    data = JSON.parse(data)
    return data.hitokoto
  },
}

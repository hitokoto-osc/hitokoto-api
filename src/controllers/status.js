'use strict'
// Import Packages
const path = require('path')
const cache = require(path.join(__dirname, '../cache'))
// const winston = require('winston')

async function getRequests () {
  const requests = await cache.get('requests')
  return requests
}

async function getPastMinute () {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getPastHour () {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getPastDay () {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60 * 24
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getDayMap (now) {
  const ts = parseInt(Date.now().toString().slice(0, 10))
  const events = []
  for (let index = 1; index < 26; index++) {
    events.push(cache.get('requests:count:' + (ts - index * 60 * 60).toString()))
  }
  const result = await Promise.all(events)
  const data = []
  data.push(now - parseInt(result[0]))
  delete result[0]
  for (let index = 0; index < (result.length - 1); index++) {
    data.push(parseInt(result[index]) - parseInt(result[index + 1]))
  }
  return data
}
module.exports = async (ctx, next) => {
  const pkg = require(path.join('../../', 'package'))
  const fetchData = await Promise.all([getRequests(), getPastMinute(), getPastHour(), getPastDay()])
  const now = fetchData[0]
  const pastMinute = fetchData[1]
  const pastHour = fetchData[2]
  const pastDay = fetchData[3]
  const dayMap = await getDayMap(now)
  ctx.body = {
    name: pkg.name,
    version: pkg.version,
    message: 'Love us? donate at https://hitokoto.cn/donate',
    website: 'https://hitokoto.cn',
    requests: {
      total: parseInt(now),
      pastMinute: parseInt(now) - parseInt(pastMinute),
      pastHour: parseInt(now) - parseInt(pastHour),
      pastDay: parseInt(now) - parseInt(pastDay),
      dayMap
    },
    feedback: {
      Kuertianshi: 'i@loli.online',
      freejishu: 'i@freejishu.com',
      a632079: 'a632079@qq.com'
    },
    copyright: 'MoeCraft © ' + new Date().getFullYear() + ' All Rights Reserved. Powered by Teng-koa ( https://github.com/a632079/teng-koa ).',
    now: new Date(Date.now()).toString(),
    ts: Date.now()
  }
}

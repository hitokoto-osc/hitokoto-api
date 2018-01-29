'use strict'
const path = require('path')
const cache = require(path.join(__dirname, '../cache'))
const winston = require('winston')
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

module.exports = {
  status: async (ctx, next) => {
    const now = await getRequests()
    const pastMinute = await getPastMinute()
    const pastHour = await getPastHour()
    const pastDay = await getPastDay()
    ctx.body = {
      requests: {
        all: parseInt(now),
        pastMinute: parseInt(now) - parseInt(pastMinute),
        pastHour: parseInt(now) - parseInt(pastHour),
        pastDay: parseInt(now) - parseInt(pastDay)
      },
      now: new Date(Date.now()).toString(),
      ts: Date.now()
    }
  }
}

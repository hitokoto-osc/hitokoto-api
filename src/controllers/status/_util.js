// Import Packages
const nconf = require('nconf')
const cache = require('../../cache')
// const winston = require('winston')
const AB = require('../../extensions/sentencesABSwitcher')
const _ = require('lodash')
const limitedHosts = [
  // hitokoto.cn
  'v1.hitokoto.cn',
  'api.hitokoto.cn',
  'sslapi.hitokoto.cn',
  'international.v1.hitokoto.cn',
  // a632079's public api
  'api.a632079.me',
  'legacy.api.a632079.me', // 新接口将移动到 api.a632079.me
]

async function getAllRequests() {
  const requests = nconf.get('middleware:requests:all')
  return requests
}

async function getAllPastMinute() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getAllPastHour() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getAllPastDay() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60 * 24
  const requests = await cache.get('requests:count:' + ts.toString())
  return requests
}

async function getHosts() {
  const requests = await cache.get('requests:hosts')
  return requests
}

async function getHostsPastMinute() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60
  const requests = await cache.get('requests:hosts:count:' + ts.toString())
  return requests
}

async function getHostsPastHour() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60
  const requests = await cache.get('requests:hosts:count:' + ts.toString())
  return requests
}

async function getHostsPastDay() {
  const ts = parseInt(Date.now().toString().slice(0, 10)) - 60 * 60 * 24
  const requests = await cache.get('requests:hosts:count:' + ts.toString())
  return requests
}

async function getAllDayMap(now) {
  const ts = parseInt(Date.now().toString().slice(0, 10))
  const events = []
  for (let index = 1; index < 26; index++) {
    events.push(
      cache.get('requests:count:' + (ts - index * 60 * 60).toString()),
    )
  }
  const result = await Promise.all(events)
  const data = []
  data.push(now - parseInt(result[0]))
  for (let index = 0; index < result.length - 2; index++) {
    data.push(parseInt(result[index]) - parseInt(result[index + 1]))
  }
  return data
}

async function getHostsDayMap(limitHosts, hosts) {
  const ts = parseInt(Date.now().toString().slice(0, 10))
  const events = []
  for (let index = 1; index < 26; index++) {
    events.push(
      cache.get('requests:hosts:count:' + (ts - index * 60 * 60).toString()),
    )
  }
  const result = await Promise.all(events)
  const data = {}
  for (const host of limitHosts) {
    const _ = result[0] ? hosts[host] - parseInt(result[0][host]) : 0
    data[host] = {}
    data[host].day_map = []
    data[host].day_map.push(_)
  }
  for (let index = 0; index < result.length - 2; index++) {
    for (const host of limitHosts) {
      const _ =
        result[index] && result[index + 1]
          ? parseInt(result[index][host]) - parseInt(result[index + 1][host])
          : null
      data[host].day_map.push(_)
    }
  }
  return data
}

async function getPast5MinuteMap(now) {
  const ts = parseInt(Date.now().toString().slice(0, 10))
  const events = []
  for (let index = 1; index < 7; index++) {
    events.push(cache.get('requests:count:' + (ts - index * 60).toString()))
  }
  const result = await Promise.all(events)
  const data = []
  data.push(now - parseInt(result[0]))
  for (let index = 0; index < result.length - 2; index++) {
    data.push(parseInt(result[index]) - parseInt(result[index + 1]))
  }
  return data
}

async function fetchData() {
  return Promise.all([
    // fetch All Requests
    getAllRequests(),
    getAllPastMinute(),
    getAllPastHour(),
    getAllPastDay(),
    // fetch hosts
    getHosts(),
    getHostsPastMinute(),
    getHostsPastHour(),
    getHostsPastDay(),
  ])
}

async function fetchDayMap({ now, limitedHosts, hosts }) {
  return Promise.all([
    getAllDayMap(now),
    getHostsDayMap(limitedHosts, hosts),
    getPast5MinuteMap(now),
  ])
}

const fetchHitokotoCollection = () => {
  return Promise.all([
    AB.get('hitokoto:bundle:categories'),
    AB.get('hitokoto:bundle:sentences:total'),
    AB.get('hitokoto:bundle:updated_at'),
  ])
}

const genHitokotoStats = async () => {
  const hitokoto = {}
  const collection = await fetchHitokotoCollection()
  hitokoto.category = collection[0].map((v) => v.key)
  hitokoto.total = collection[1]
  hitokoto.last_updated = collection[2]
  return hitokoto
}

const genHostsWithValidHostList = (fetchData) => {
  const hosts = {}
  const HostToDelete = []
  const HostsData = fetchData[4] || {}
  for (const i of limitedHosts) {
    if (!HostsData[i]) {
      // if not exist
      HostToDelete.push(i)
    } else {
      hosts[i] = {}
      hosts[i].total = HostsData[i] || 0
      hosts[i].past_minute = fetchData[5]
        ? parseInt(HostsData[i]) - parseInt(fetchData[5][i])
        : null
      hosts[i].past_hour = fetchData[6]
        ? parseInt(HostsData[i]) - parseInt(fetchData[6][i])
        : null
      hosts[i].past_day = fetchData[7]
        ? parseInt(HostsData[i]) - parseInt(fetchData[7][i])
        : null
    }
  }
  return [hosts, _.pullAll([...limitedHosts], HostToDelete)]
}

const getMemoryUsage = () => {
  let memoryUsage = 0
  for (const v of Object.values(process.memoryUsage())) {
    memoryUsage += parseInt(v)
  }
  return memoryUsage
}

module.exports = {
  fetchData,
  fetchDayMap,
  getMemoryUsage,
  genHostsWithValidHostList,
  genHitokotoStats,
}

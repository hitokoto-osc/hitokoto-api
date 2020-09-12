const pkg = require('../../../package.json')
const os = require('os')
const nconf = require('nconf')
const {
  fetchData,
  genHostsWithValidHostList,
  genHitokotoStats,
  getMemoryUsage,
  fetchDayMap,
} = require('./_util')

module.exports = async (ctx) => {
  const data = await fetchData()
  // All
  const all = {}
  all.now = fetchData[0] || 0
  all.past_minute = fetchData[1]
  all.past_hour = fetchData[2]
  all.past_day = fetchData[3]
  // Hosts
  const [[hosts, limitedHosts], hitokoto] = await Promise.all([
    genHostsWithValidHostList(data),
    genHitokotoStats(),
  ])
  // DayMap
  const dayMap = await fetchDayMap({
    now: all.now,
    fetchData: data,
    limitedHosts,
  })
  all.day_map = dayMap[0]
  all.five_minutes_map = fetchDayMap[2]
  for (const host of limitedHosts) {
    Object.assign(hosts[host], fetchDayMap[1][host])
  }

  const memoryUsage = getMemoryUsage()
  ctx.body = {
    name: pkg.name,
    version: pkg.version,
    message: 'Love us? donate at https://hitokoto.cn/donate',
    website: 'https://hitokoto.cn',
    server_id: nconf.get('api_name') ? nconf.get('api_name') : 'unallocated',
    server_status: {
      memory: {
        total: os.totalmem() / (1024 * 1024),
        free: os.freemem() / (1024 * 1024),
        usage: memoryUsage / (1024 * 1024),
      },
      // cpu: os.cpus(),
      load: os.loadavg(),
      hitokoto,
    },
    requests: {
      all: {
        total: parseInt(all.now),
        past_minute: parseInt(all.now) - parseInt(all.past_minute),
        past_hour: parseInt(all.now) - parseInt(all.past_hour),
        past_day: parseInt(all.now) - parseInt(all.past_day),
        day_map: all.day_map,
        five_minutes_map: all.five_minutes_map,
      },
      hosts,
    },
    feedback: {
      Kuertianshi: 'i@loli.online',
      freejishu: 'i@freejishu.com',
      a632079: 'a632079@qq.com',
    },
    copyright:
      'MoeCraft © ' +
      new Date().getFullYear() +
      ' All Rights Reserved. Powered by Teng-koa. Open Source at https://github.com/hitokoto-osc/hitokoto-api .',
    now: new Date(Date.now()).toString(),
    ts: Date.now(),
  }
}

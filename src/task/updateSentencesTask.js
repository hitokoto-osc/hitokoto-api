/* eslint-disable node/no-deprecated-api */
// const path = require('path')
const url = require('url')

const winston = require('winston')
const axios = require('axios')
const colors = require('colors')
const nconf = require('nconf')
const semver = require('semver')
const _ = require('lodash')

const cache = require('../cache')

async function Task () {
  // TODO: 按需同步流程中移除失效句子（在包中移除的句子）
  winston.verbose('开始更新句子记录...')
  const startTick = Date.now()
  // 取得本地数据版本
  const localBundleVersion = await cache.get('hitokoto:bundle:version') || '0.0.0'
  const localBundleUpdatedAt = await cache.get('hitokoto:bundle:updated_at') || 0
  const localBundleVersionData = await cache.get('hitokoto:bundle:version:record') || {}
  // 获取远程数据的版控文件
  const remoteUrl = nconf.get('remote_sentences_url') || 'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/'
  let response = await axios.get(url.resolve(remoteUrl, './version.json'))
  const remoteVersionData = response.data

  if (!semver.satisfies(remoteVersionData.protocol_version, '>=1.0 <1.1')) {
    winston.error('当前程序版本不支持此协议版本，请更新程序！')
    return
  }
  if (semver.eq(remoteVersionData.bundle_version, localBundleVersion) && localBundleUpdatedAt === remoteVersionData.updated_at) {
    winston.verbose('与服务器记录一致，无需更新。')
    return // 版本相同且生成时间戳相同、无需更新
  }
  // 需要更新，首先确认本地版本
  if (localBundleVersion === '0.0.0') { // 初次启动、全量同步数据
    // 获取分类数据
    response = await axios.get(url.resolve(remoteUrl, remoteVersionData.categories.path))
    const remoteCategoriesData = response.data
    await cache.set('hitokoto:bundle:categories', remoteCategoriesData)

    const rClient = cache.getClient()
    for (const category of remoteCategoriesData) {
      // 读取分类的数据
      response = await axios.get(url.resolve(remoteUrl, category.path))
      const categorySentences = response.data
      for (const sentence of categorySentences) {
        await Promise.all([
          cache.set('hitokoto:sentence:' + sentence.uuid, sentence),
          rClient.zaddAsync(['hitokoto:bundle:category:' + category.key, sentence.length, sentence.uuid])
        ])
      }
    }
  } else { // 挨个比对，按需求同步
    // 首先比对分类信息
    const localCategoriesData = cache.get('hitokoto:bundle:categories') || []
    if (localCategoriesData.length === 0) {
      await cache.set('hitokoto:bundle:version', '0.0.0')
      RunTask()
      return
    }
    const rClient = cache.getClient()
    if (!remoteVersionData.categories.timestamp !== localBundleVersionData.categories.timestamp) {
      // 读取远端分类信息
      response = await axios.get(url.resolve(remoteUrl, remoteVersionData.categories.path))
      const remoteCategoryData = response.data

      const categoriedNeededToAppend = []
      for (const category of remoteCategoryData) {
        const c = _.find(localCategoriesData, { key: category.key })
        if (!c) {
          categoriedNeededToAppend.push(category)
        }
      }
      for (const category of categoriedNeededToAppend) {
        // 读取分类的数据
        response = await axios.get(url.resolve(remoteUrl, category.path))
        const categorySentences = response.data
        for (const sentence of categorySentences) {
          await Promise.all([
            cache.set('hitokoto:sentence:' + sentence.uuid, sentence),
            rClient.zaddAsync(['hitokoto:bundle:category:' + category.key, sentence.length, sentence.uuid])
          ])
        }
      }
      await cache.set('hitokoto:bundle:categories', remoteCategoryData)
    }

    // 然后比对句子信息
    for (const categoryVersion of localBundleVersionData.sentences) {
      const remoteVersion = _.find(remoteVersionData, { key: categoryVersion.key })
      if (!remoteVersion) {
        // 多半是此分类被删除
        continue
      }
      if (remoteVersion.timestamp !== categoryVersion.timestamp) { // 需要更新
        response = await axios.get(url.resolve(remoteUrl, categoryVersion.path))
        const categorySentences = response.data
        const queue = (await cache.getClient(true)).multi()
        queue.del('hitokoto:bundle:category:' + categoryVersion.key)
        for (const sentence of categorySentences) {
          queue.set('hitokoto:sentence:' + sentence.uuid, sentence)
          queue.zadd(['hitokoto:bundle:category:' + categoryVersion.key, sentence.length, sentence.uuid])
        }
        await queue.execAsync()
        queue.quit() // 结束连接
      }
    }
  }

  // 更新版本记录
  await Promise.all([
    cache.set('hitokoto:bundle:version', remoteVersionData.bundle_version),
    cache.set('hitokoto:bundle:updated_at', remoteVersionData.updated_at),
    cache.set('hitokoto:bundle:version:record', remoteVersionData)
  ])

  winston.verbose('执行完成，耗时：' + (Date.now() - startTick) + ' ms')
}

function RunTask () {
  Task()
    .catch(err => {
      console.log(colors.red(err.stack))
      winston.error('执行同步句子操作时发生错误。')
    })
}

module.exports = {
  RunTask,
  Task
}

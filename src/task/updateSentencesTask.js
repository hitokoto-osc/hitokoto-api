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
const AB = require('../extensions/sentencesABSwitcher')

async function Task () {
  // TODO: 按需同步流程中移除失效句子（在包中移除的句子）
  winston.verbose('[sentencesUpdateTask] start to update...')
  const startTick = Date.now()
  // 取得 AB 库的指针
  const currentABSlot = await cache.get('hitokoto:ab') || 'a'
  AB.setDatabase(currentABSlot)
  // 取得本地数据版本
  const localBundleVersion = await AB.get('hitokoto:bundle:version') || '0.0.0'
  const localBundleUpdatedAt = await AB.get('hitokoto:bundle:updated_at') || 0
  const localBundleVersionData = await AB.get('hitokoto:bundle:version:record') || {}
  // 获取远程数据的版控文件
  const remoteUrl = nconf.get('remote_sentences_url') || 'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/'
  let response = await axios.get(url.resolve(remoteUrl, './version.json'))
  const remoteVersionData = response.data

  if (!semver.satisfies(remoteVersionData.protocol_version, '>=1.0 <1.1')) {
    winston.error('[sentencesUpdateTask] This program version is NOT support the protocol version: ' + remoteVersionData.protocol_version + ', please update your program.')
    return
  }
  if (semver.eq(remoteVersionData.bundle_version, localBundleVersion) && localBundleUpdatedAt === remoteVersionData.updated_at) {
    winston.verbose('[sentencesUpdateTask] The local records are same with the remote one, update ended.')
    return // 版本相同且生成时间戳相同、无需更新
  }
  // 需要更新，首先确认本地版本
  const targetDatabase = currentABSlot === 'a' ? 'b' : 'a'
  const SideAB = AB.getConnection(targetDatabase)
  let sentenceTotal = 0
  if (localBundleVersion === '0.0.0') { // 初次启动、全量同步数据
    // 获取分类数据
    response = await axios.get(url.resolve(remoteUrl, remoteVersionData.categories.path))
    const remoteCategoriesData = response.data
    await SideAB.set('hitokoto:bundle:categories', remoteCategoriesData)

    const rClient = SideAB.getClient()
    for (const category of remoteCategoriesData) {
      // 读取分类的数据
      response = await axios.get(url.resolve(remoteUrl, category.path))
      const categorySentences = response.data
      let minLength
      let maxLength
      for (const sentence of categorySentences) {
        // generate Length range
        if (!minLength) {
          minLength = sentence.length
        }
        if (!maxLength) {
          maxLength = sentence.length
        }
        if (sentence.length < minLength) {
          minLength = sentence.length
        } else if (sentence.length > maxLength) {
          maxLength = sentence.length
        }
        await Promise.all([
          SideAB.set('hitokoto:sentence:' + sentence.uuid, sentence),
          rClient.zaddAsync(['hitokoto:bundle:category:' + category.key, sentence.length, sentence.uuid])
        ])
      }
      // 保存句子长度范围
      await SideAB.set(`hitokoto:bundle:category:${category.key}:max`, maxLength)
      await SideAB.set(`hitokoto:bundle:category:${category.key}:min`, minLength)
      sentenceTotal += categorySentences.length
    }
  } else { // 挨个比对，按需求同步
    // 首先比对分类信息
    const localCategoriesData = SideAB.get('hitokoto:bundle:categories') || []
    if (localCategoriesData.length === 0) {
      await SideAB.set('hitokoto:bundle:version', '0.0.0')
      RunTask()
      return
    }
    const rClient = SideAB.getClient()
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
        let minLength
        let maxLength
        for (const sentence of categorySentences) {
          // generate Length range
          if (!minLength) {
            minLength = sentence.length
          }
          if (!maxLength) {
            maxLength = sentence.length
          }
          if (sentence.length < minLength) {
            minLength = sentence.length
          } else if (sentence.length > maxLength) {
            maxLength = sentence.length
          }
          await Promise.all([
            SideAB.set('hitokoto:sentence:' + sentence.uuid, sentence),
            rClient.zaddAsync(['hitokoto:bundle:category:' + category.key, sentence.length, sentence.uuid])
          ])
        }
        // 保存句子长度范围
        await SideAB.set(`hitokoto:bundle:category:${category.key}:max`, maxLength)
        await SideAB.set(`hitokoto:bundle:category:${category.key}:min`, minLength)
      }
      await SideAB.set('hitokoto:bundle:categories', remoteCategoryData)
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
        const queue = (await cache.getClient()).multi()
        queue.del('hitokoto:bundle:category:' + categoryVersion.key)
        let minLength
        let maxLength
        for (const sentence of categorySentences) {
          // generate Length range
          if (!minLength) {
            minLength = sentence.length
          }
          if (!maxLength) {
            maxLength = sentence.length
          }
          if (sentence.length < minLength) {
            minLength = sentence.length
          } else if (sentence.length > maxLength) {
            maxLength = sentence.length
          }
          queue.set('hitokoto:sentence:' + sentence.uuid, sentence)
          queue.zadd(['hitokoto:bundle:category:' + categoryVersion.key, sentence.length, sentence.uuid])
        }
        // 保存句子长度范围
        await queue.set(`hitokoto:bundle:category:${queue.key}:max`, maxLength)
        await queue.set(`hitokoto:bundle:category:${queue.key}:min`, minLength)
        await queue.execAsync()
        queue.quit() // 结束连接
      }
    }

    // 获得句子总数，由于以上的增量实现无法正确统计，因此咱们用一个偷懒的方法（以后优化）
    const categories = await SideAB.get('hitokoto:bundle:categories')
    for (const category of categories) {
      sentenceTotal += await SideAB.command('zcount', 'hitokoto:bundle:category:', category.key)
    }
  }

  // 更新版本记录
  await Promise.all([
    SideAB.set('hitokoto:bundle:version', remoteVersionData.bundle_version),
    SideAB.set('hitokoto:bundle:updated_at', remoteVersionData.updated_at),
    SideAB.set('hitokoto:bundle:version:record', remoteVersionData),
    SideAB.set('hitokoto:bundle:sentences:total', sentenceTotal)
  ])
  // 切换数据库
  AB.setDatabase(targetDatabase)
  cache.set('hitokoto:ab', targetDatabase)
  winston.verbose('[sentencesUpdateTask] having finished the update, spend ' + (Date.now() - startTick) + ' ms.')
  return targetDatabase
}

function RunTask () {
  Task()
    .then(targetDB => {
      if (targetDB && typeof targetDB === 'string') {
        targetDB = Number.parseInt(targetDB)
      }
      return targetDB
    })
    .then(targetDB => {
      if (process.send && Number.isInteger(targetDB)) { // is in CronProcess
        process.send({
          key: 'switchAB',
          to: 'ab',
          data: targetDB
        })
      }
    })
    .catch(err => {
      console.log(colors.red(err.stack))
      winston.error('[sentencesUpdateTask] occur errors while update, please check the details. if occurs frequently, contact the author please.')
    })
}

module.exports = {
  RunTask,
  Task
}

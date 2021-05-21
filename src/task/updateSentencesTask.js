/* eslint-disable node/no-deprecated-api */
// const path = require('path')
const { logger } = require('../logger')
const chalk = require('chalk')
// const nconf = require('nconf')
const semver = require('semver')
const cache = require('../cache')
const AB = require('../extensions/sentencesABSwitcher')
const {
  fetchRemoteVersionData,
  checkBundleProtocolVersion,
  updateSentences,
} = require('./update_sentences_utils/base')
// abstract logic block

async function Task() {
  // TODO: 按需同步流程中移除失效句子（在包中移除的句子）
  logger.verbose('[sentencesUpdateTask] start to update...')
  const startTick = Date.now()
  // 取得 AB 库的指针
  const currentABSlot = (await cache.get('hitokoto:ab')) || 'a'
  AB.setDatabase(currentABSlot)
  logger.verbose('[sentencesUpdateTask] current AB slot: ' + chalk.blue(AB.db))
  // 取得本地数据版本
  const local = {
    bundleVersion: (await AB.get('hitokoto:bundle:version')) || '0.0.0',
    bundleUpdatedAt: (await AB.get('hitokoto:bundle:updated_at')) || 0,
    bundleVersionData: (await AB.get('hitokoto:bundle:version:record')) || {},
  }

  // 获取远程数据的版控文件
  const remoteVersionData = await fetchRemoteVersionData()
  logger.verbose(
    '[sentencesUpdateTask] remote bundle protocol version: ' +
      chalk.green('v' + remoteVersionData.protocol_version),
  )
  checkBundleProtocolVersion(remoteVersionData, local)
  logger.verbose(
    '[sentencesUpdateTask] remote bundle version: ' +
      chalk.yellow('v' + remoteVersionData.bundle_version),
  )
  logger.verbose(
    '[sentencesUpdateTask] local bundle version: ' +
      chalk.yellow('v' + local.bundleVersion),
  )
  if (
    semver.eq(remoteVersionData.bundle_version, local.bundleVersion) &&
    local.bundleUpdatedAt === remoteVersionData.updated_at
  ) {
    logger.verbose(
      '[sentencesUpdateTask] the local records are same with the remote one, update ended.',
    )
    return // 版本相同且生成时间戳相同、无需更新
  }

  // 更新句子集
  await updateSentences(
    local,
    remoteVersionData,
    currentABSlot,
    startTick,
    local.bundleVersion === '0.0.0',
  )
}

function RunTask() {
  Task().catch((err) => {
    logger.error(chalk.red(err.stack))
    logger.error(
      '[sentencesUpdateTask] occur errors while update, please check the details. if occurs frequently, contact the author please.',
    )
  })
}

module.exports = {
  RunTask,
  Task,
}

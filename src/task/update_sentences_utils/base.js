// import modules
const _ = require('lodash')
const AB = require('../../extensions/sentencesABSwitcher')
const Cache = require('../../cache')
const winston = require('winston')
const got = require('got')
const chalk = require('chalk')
const nconf = require('nconf')
const semver = require('semver')
const { URL } = require('url')
module.exports = exports = {}

const remoteURL =
  nconf.get('remote_sentences_url') ||
  'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/'

async function performRequest(url, method = 'GET', params) {
  const response = await got[method.toLocaleLowerCase()](
    url,
    Object.assign(
      {
        responseType: 'json',
        timeout: 15000, // 默认 15 秒
      },
      params,
    ),
  )
  if (response.statusCode !== 200) {
    winston.error(response)
    throw new Error(
      '[sentencesUpdateTask] Request failed because the response status code is not 200.',
    )
  }
  return response.body
}

exports.fetchRemoteVersionData = async () => {
  const remoteVersionURL = new URL('./version.json', remoteURL).toString()
  winston.verbose(
    '[sentencesUpdateTask] fetching version data from: ' +
      chalk.green(remoteVersionURL),
  )

  return performRequest(remoteVersionURL)
}

exports.checkBundleProtocolVersion = (remoteVersionData, local) => {
  if (!semver.satisfies(remoteVersionData.protocol_version, '>=1.0 <1.1')) {
    // 约束协议范围
    winston.error(
      '[sentencesUpdateTask] This program is currently NOT support the protocol version: ' +
        remoteVersionData.protocol_version +
        ', please update your program.',
    )
    process.exit(1)
  }
}

exports.updateSentences = async (
  local,
  remoteVersionData,
  currentABSlot,
  startTick,
  ignoreComparison = false,
) => {
  const targetDatabase = currentABSlot === 'a' ? 'b' : 'a'
  const SideAB = AB.getConnection(targetDatabase)
  const sentenceTotal = await (ignoreComparison
    ? fullSentencesUpgrade(remoteVersionData, SideAB)
    : UpgradeSentencesThatShouldBeUpdated(local, remoteVersionData, SideAB))
  // 更新版本记录
  await Promise.all([
    SideAB.set('hitokoto:bundle:version', remoteVersionData.bundle_version),
    SideAB.set('hitokoto:bundle:updated_at', remoteVersionData.updated_at),
    SideAB.set('hitokoto:bundle:version:record', remoteVersionData),
    SideAB.set('hitokoto:bundle:sentences:total', sentenceTotal),
  ])
  // 切换数据库分区
  Cache.set('hitokoto:ab', targetDatabase)
  AB.setDatabase(targetDatabase)
  winston.verbose(
    '[sentencesUpdateTask] total sentences: ' + chalk.cyan(sentenceTotal),
  )
  winston.verbose(
    '[sentencesUpdateTask] having finished the update, spend ' +
      (Date.now() - startTick) +
      ' ms.',
  )
  if (process.send) {
    // 如果是处于计划任务中，则发信通知主进程切换分区
    notifyMasterSwitchDB(targetDatabase)
  }
}

function notifyMasterSwitchDB(targetDatabase) {
  winston.verbose(
    '[sentencesUpdateTask] notify master process to switch redis db to: ' +
      chalk.yellow(targetDatabase),
  )
  process.send({
    key: 'switchAB',
    to: 'ab',
    data: targetDatabase,
    matchFrom: true,
  })
}

async function fullSentencesUpgrade(remoteVersionData, SideAB) {
  const remoteCategoriesData = await fetchRemoteCategoriesData(
    remoteVersionData,
  )
  await SideAB.set('hitokoto:bundle:categories', remoteCategoriesData)
  let sentencesTotal = 0
  for (const category of remoteCategoriesData) {
    sentencesTotal += await updateSpecificCategorySentences(SideAB, category)
  }
  return sentencesTotal
}

async function UpgradeSentencesThatShouldBeUpdated(
  local,
  remoteVersionData,
  SideAB,
) {
  let localCategoriesData = (await AB.get('hitokoto:bundle:categories')) || []
  if (localCategoriesData.length === 0) {
    return fullSentencesUpgrade(remoteVersionData, SideAB)
  }
  if (
    remoteVersionData.categories.timestamp !==
    local.bundleVersionData.categories.timestamp // 检测分类列表是否更新
  ) {
    const remoteCategoriesData = await fetchRemoteCategoriesData(
      remoteVersionData,
    )
    const categoriesNeededToAppend = getCategoriesThatShouldBeAppended(
      localCategoriesData,
      remoteCategoriesData,
    )
    for (const category of categoriesNeededToAppend) {
      await updateSpecificCategorySentences(SideAB, category)
    }
    await SideAB.set('hitokoto:bundle:categories', remoteCategoriesData) // 更新分类信息
    localCategoriesData = remoteCategoriesData
  }
  // 比对句子信息
  for (const categoryVersion of local.bundleVersionData.sentences) {
    const remoteVersion = _.find(remoteVersionData, {
      key: categoryVersion.key,
    })
    if (!remoteVersion) {
      // 多半是此分类被删除，或者易名
      // TODO: 建立追踪算法，移除失效分类的所有句子
      continue
    }
    if (remoteVersion.timestamp !== categoryVersion.timestamp) {
      // 说明需要更新分类
      await updateSpecificCategorySentences(SideAB, categoryVersion)
    }
  }
  // 获得句子总数，由于以上的增量实现无法正确统计，因此咱们用一个偷懒的方法（以后优化）
  // TODO: 优化句子统计算法
  const sentencesTotal = await getSentencesTotal(SideAB, localCategoriesData)
  // 更新版本记录
  await Promise.all([
    SideAB.set('hitokoto:bundle:version', remoteVersionData.bundle_version),
    SideAB.set('hitokoto:bundle:updated_at', remoteVersionData.updated_at),
    SideAB.set('hitokoto:bundle:version:record', remoteVersionData),
    SideAB.set('hitokoto:bundle:sentences:total', sentencesTotal),
  ])
  return sentencesTotal
}

function getCategoriesThatShouldBeAppended(
  localCategoriesData,
  remoteCategoriesData,
) {
  const categoriesNeededToAppend = []
  for (const category of remoteCategoriesData) {
    if (!_.find(localCategoriesData, { key: category.key })) {
      categoriesNeededToAppend.push(category)
    }
  }
  return categoriesNeededToAppend
}

async function updateSpecificCategorySentences(SideAB, category) {
  let categorySentencesTotal = 0
  let minLength = 1000 // TODO: 更合理的算法，目前赋值 1000 只是为了最小值正确
  let maxLength = 0
  const categorySentences = await fetchRemoteCategorySentencesByPath(
    category.path,
  )
  // 迭代写入句子
  await SideAB.getClient().del('hitokoto:bundle:category:' + category.key) // 预移除区间队列
  for (const sentence of categorySentences) {
    // 建立分类句子长度范围
    if (sentence.length < minLength) {
      minLength = sentence.length
    } else if (sentence.length > maxLength) {
      maxLength = sentence.length
    }
    await Promise.all([
      SideAB.set('hitokoto:sentence:' + sentence.uuid, sentence),
      SideAB.getClient().zadd([
        'hitokoto:bundle:category:' + category.key,
        sentence.length,
        sentence.uuid,
      ]),
    ])
    categorySentencesTotal++
  }
  await Promise.all([
    SideAB.set(`hitokoto:bundle:category:${category.key}:max`, maxLength),
    SideAB.set(`hitokoto:bundle:category:${category.key}:min`, minLength),
  ])
  winston.verbose(
    `[sentencesUpdateTask] the sentences of category ${chalk.red(
      category.key,
    )} is updated. Max length: ${chalk.green(
      maxLength,
    )}, min length: ${chalk.green(minLength)}, total: ${chalk.blue(
      categorySentencesTotal,
    )}`,
  )
  return categorySentencesTotal
}

async function fetchRemoteCategorySentencesByPath(path) {
  const remoteSentenceURL = new URL(path, remoteURL).toString()
  winston.verbose(
    '[sentencesUpdateTask] fetching sentences data from: ' +
      chalk.green(remoteSentenceURL),
  )
  return performRequest(remoteSentenceURL)
}

async function fetchRemoteCategoriesData(remoteVersionData) {
  const remoteCategoriesURL = new URL(
    remoteVersionData.categories.path,
    remoteURL,
  ).toString()
  winston.verbose(
    '[sentencesUpdateTask] fetching categories data from: ' +
      chalk.green(remoteCategoriesURL),
  )
  return performRequest(remoteCategoriesURL)
}

// TODO: 这个方法是一个偷懒的实现，以后进行优化
async function getSentencesTotal(SideAB, categories) {
  categories = categories ?? (await SideAB.get('hitokoto:bundle:categories'))
  const queue = []
  categories.forEach((v) =>
    queue.push(
      SideAB.command('zcount', [
        'hitokoto:bundle:category:' + v.key,
        '0',
        '+inf',
      ]),
    ),
  )
  const result = await Promise.all(queue)
  let total = 0
  for (const count of result) {
    total += parseInt(count)
  }
  return total
}

// Load Packages
const fs = require('fs')
const { logger } = require('./logger')
const chalk = require('chalk')
const path = require('path')
const { promisify } = require('util')
async function readDir(dir) {
  const files = await promisify(fs.readdir)(dir)
  if (files.length <= 0) return
  const map = {}
  for (const file of files) {
    if (file.startsWith('_')) {
      // Ignore hidden files
      continue
    }
    const filePath = path.join(dir, file)
    const stat = await promisify(fs.stat)(filePath)
    if (stat.isDirectory()) {
      const subDirMaps = await readDir(filePath)
      if (subDirMaps) {
        map[file] = map[file]
          ? Object.assign(map[file], subDirMaps)
          : subDirMaps
      }
    } else {
      map[file.substring(0, file.length - 3)] = map[
        file.substring(0, file.length - 3)
      ]
        ? Object.assign(
            map[file.substring(0, file.length - 3)],
            require(filePath),
          )
        : require(filePath)
    }
  }
  return map
}

function genControllersMap() {
  const dir = path.join(__dirname, './controllers')
  return readDir(dir)
}

class controllers {
  constructor(controller) {
    if (controller) {
      // Register Controller
      return this.register(controller)
    } else {
      // Auto-load All Controllers
      return this.load()
    }
  }

  register(controller) {
    try {
      return require(path.join(
        __dirname,
        '../',
        './src/controllers',
        controller,
      ))
    } catch (e) {
      logger.error(chalk.red(e))
      // mail.error(e)
      process.exit(1)
    }
  }

  async load() {
    try {
      // Load Controller
      const controllers = await genControllersMap()
      return controllers
    } catch (e) {
      logger.error(chalk.red(e))
      process.exit(1)
    }
  }
}

module.exports = controllers

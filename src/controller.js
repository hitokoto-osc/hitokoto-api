// Load Packages
const fs = require('fs')
const winston = require('winston')
const colors = require('colors/safe')
const path = require('path')

function readDir (dir) {
  const files = fs.readdirSync(dir)
  if (files.length <= 0) return
  const map = {}
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      const subDirMaps = readDir(filePath)
      if (subDirMaps) {
        map[file] = map[file]
          ? Object.assign(
            map[file],
            subDirMaps
          )
          : subDirMaps
      }
    } else {
      map[file.substring(0, file.length - 3)] = map[file.substring(0, file.length - 3)]
        ? Object.assign(
          map[file.substring(0, file.length - 3)],
          require(filePath)
        )
        : require(filePath)
    }
  }
  return map
}

function genControllersMap () {
  const dir = path.join(__dirname, './controllers')
  return readDir(dir)
}

class controllers {
  constructor (controller) {
    if (controller) {
      // Register Controller
      return this.register(controller)
    } else {
      // Auto-load All Controllers
      return this.load()
    }
  }

  register (controller) {
    try {
      return require(path.join(__dirname, '../', './src/controllers', controller))
    } catch (e) {
      winston.error(colors.red(e))
      // mail.error(e)
      process.exit(1)
    }
  }

  async load () {
    try {
      // Load Controller
      const controllers = genControllersMap()
      return controllers
    } catch (e) {
      winston.error(colors.red(e))
      process.exit(1)
    }
  }
}

module.exports = controllers

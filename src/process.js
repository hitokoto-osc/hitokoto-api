// This module is intended to provide a helper of generating child processes
const path = require('path')
const childProcess = require('child_process')
const { EventEmitter } = require('events')
const winston = require('winston')
const nconf = require('nconf')
const colors = require('colors')
const _ = require('lodash')

const event = new EventEmitter()
class ProcessInteract {
  constructor (list) {
    this.routeMap = Array.isArray(list) ? list : []
  }

  register () {
    winston.verbose('[processInteract] prepare to register receivers.')
    // DEV only
    this.routeMap.map(v => {
      winston.verbose('[processInteract] receiver is registered, key: ' + colors.red(v.key) + ' , to: ' + colors.yellow(v.to) + ' , from: ' + colors.green(v.from))
    })
    event.on('message', (msg, moduleName) => {
      winston.verbose('[processInteract] received a message, detail: ', colors.grey(JSON.stringify(msg)))
      if (msg && msg.key) {
        // match route
        const matchRule = msg.from && msg.matchFrom ? { key: msg.key, to: msg.to, from: msg.from } : { key: msg.key, to: msg.to }
        const matches = _.find(this.routeMap, matchRule)
        if (matches) {
          matches.listener(msg.data)
        } else {
          winston.warn('[processInteract] routekey is missing, raw data: ' + colors.grey(JSON.stringify(msg)))
        }
      }
    })
  }
}

class Process {
  constructor () {
    /**
     * The childProcessList is a processes' instances collection
     * struct is:
     * [
     *   {
     *     name: String, // moduleName,
     *     instance: Class/Object // the instance of the childProcess
     *   },
     *   ...
     * ]
     */
    this.childProcessList = []
  }

  get ProcessList () {
    return this.childProcessList
  }

  spawnProcess (execFileAbsolutePath, moduleName, messageLisenner = null) {
    const child = childProcess.fork(path.join(execFileAbsolutePath), {
      env: Object.assign(process.env, {
        dev: !!nconf.get('dev')
      })
    })
    this.childProcessList.push({
      instance: child,
      name: moduleName
    })
    const ml = typeof messageLisenner === 'function' ? messageLisenner : (message, { event, moduleName }) => {
      // emit msg to global process route
      if (message && message.key) {
        message.from = moduleName
        event.emit('message', message.data, moduleName)
      }
    }
    child.on('message', (message) => ml(message, { event, moduleName })) // compact event
    child.on('exit', this.handleChildProcessExitEvent(moduleName, execFileAbsolutePath, ml))
  }

  handleChildProcessExitEvent (moduleName, path, messageLisenner) {
    return (code, signal) => {
      if (code === null && !signal) {
        winston.warn('[' + moduleName + '] process is exited accidentally. Try to respawn it.')
        // rm invalid process
        _.remove(this.childProcessList, { name: moduleName })
        this.spawnProcess(path, moduleName, messageLisenner)
      } else if (code > 0) { // errors might be thrown
        winston.error('[' + moduleName + '] child process exited with code: ' + code + ', master process exits to ensure the stablity.')
        process.exit(1)
      } else if (signal) { // exist ignore
        winston.info('[' + moduleName + '] process is exited due to receiving a signal: ' + colors.blue(signal))
      } // ignore exit code: 0
    }
  }
}

let processes = null
function staticProcess () {
  if (!processes) {
    processes = new Process()
  }
  return processes
}

module.exports = {
  Process,
  ProcessInteract,
  staticProcess
}

// This module is intended to provide a helper of generating child processes
const path = require('path')
const childProcess = require('child_process')
const winston = require('winston')
const nconf = require('nconf')
const colors = require('colors')

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
      env: {
        dev: !!nconf.get('dev')
      }
    })
    this.childProcessList.push({
      instance: child,
      name: moduleName
    })
    const ml = typeof messageLisenner === 'function' ? messageLisenner : (message) => {
      if (message && message.key === 'loaded') {
        winston.verbose('[' + moduleName + '] process are started.')
      }
    }
    child.on('message', ml)
    child.on('exit', this.handleChildProcessExitEvent(moduleName, execFileAbsolutePath, ml))
  }

  handleChildProcessExitEvent (moduleName, path, messageLisenner) {
    return (code, signal) => {
      if (code === null && !signal) {
        winston.warn('[' + moduleName + '] process is exited accidentally. Try to respawn it.')
        this.spawnProcess(path, moduleName, messageLisenner)
      } else if (code > 0) { // errors might be thrown
        winston.error('[' + moduleName + '] child process exited with code: ' + code + ', master process exits to ensure the stablity.')
        process.exit(1)
      } else if (signal) { // exist ignore
        winston.info('[' + moduleName + '] process is exited due to receive sinal: ' + colors.blue(signal))
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
  staticProcess
}

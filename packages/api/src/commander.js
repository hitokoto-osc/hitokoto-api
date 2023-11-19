'use strict'
const pkg = require('../package.json')
function process() {
  const { program } = require('commander')
  program
    .name('node')
    .usage('core [options]')
    .option('-c, --config_file <string>', '指定配置文件路径')
    .option('-D, --dev', '开发者模式')
    .version(pkg.version, '-v, --version', '查看程序版本号')
    .helpOption('-h, --help', '查看程序指令帮助')

  program.on('--help', () => {
    console.log('')
    console.log('你可以像这样启动示例：')
    console.log('  $ yarn start')
  })
  program.parse(process.argv)
  const opts = program.opts()
  return { program, opts }
}

module.exports = {
  process,
}

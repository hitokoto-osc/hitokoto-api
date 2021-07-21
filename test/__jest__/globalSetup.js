require('regenerator-runtime/runtime')
const ps = require('./process')
module.exports = async () => {
  await ps.setup()
}

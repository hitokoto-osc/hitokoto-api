const ps = require('./process')
module.exports = async () => {
  await ps.teardown()
}

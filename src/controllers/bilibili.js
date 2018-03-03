const SDK = require('bilibili-api').default
const cache = require('../cache')
const sdk = new SDK()
const controllers = {}

controllers.search()

module.exports = controllers

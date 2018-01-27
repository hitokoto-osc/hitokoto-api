const Sequelize = require('sequelize')
const nconf = require('nconf')
const winston = require('winston')
const path = require('path')

class db {
  constructor (model) {
    this.connect()
    return this.registerModel(model)
  }
  static async connect () {
    const type = nconf.get('database')
    const config = {
      password: nconf.get(type + ':password'),
      username: nconf.get(type + ':username'),
      database: nconf.get(type + ':database'),
      host: nconf.get(type + ':host'),
      port: nconf.get(type + ':port')
    }
    const sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: type,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      operatorsAliases: false
    })
    // Test Connection
    await sequelize.authenticate()
      .then(() => {
        winston.verbose('Database Connection has been established successfully.')
      })
      .catch(err => {
        winston.error(err)
        process.exit(1)
      })

    this.sequelize = sequelize
    return true
  }
  static registerModel (model) {
    this.connect()
    this[model] = this.sequelize.define(model, require(path.join(__dirname, '../', './src/models/databases', model, '.js')))
    return this[model]
  }

  static load () {
    this.connect()
    return this
  }
}

module.exports = db

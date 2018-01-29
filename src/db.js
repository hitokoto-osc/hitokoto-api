const Sequelize = require('sequelize')
const nconf = require('nconf')
const path = require('path')
const winston = require('winston')

class db {
  constructor (model) {
    this.connect()
    return this.registerModel(model)
  }
  static async connect () {
    if (this.sequelize) {
      return this.sequelize
    } else {
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
        logging: (log) => {
          winston.debug(log)
        },
        operatorsAliases: false
      })
      // Test Connection
      await sequelize.authenticate()
        .then(() => {
          winston.verbose('Database Connection has been established successfully.')
        })
        .catch(err => {
          winston.error(err.message)
        })

      this.sequelize = sequelize
      return sequelize
    }
  }
  static async registerModel (model) {
    await this.connect()
    if (this[model]) {
      return this[model]
    } else {
      // Register Model
      const modelArray = require(path.join(__dirname, '../', './src/models/databases', model))
      this[model] = this.sequelize.define(model, modelArray[0], modelArray[1])
      return this[model]
    }
  }

  static get () {
    this.connect()
    return this
  }
}

module.exports = db

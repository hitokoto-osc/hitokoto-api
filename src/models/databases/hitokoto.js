// Load Base Model
const model = require('./model')

// Define Database Model
module.exports = [{
  id: {
    type: model.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hitokoto: model.STRING,
  type: model.STRING,
  from: model.STRING,
  from_who: model.STRING,
  creator: model.STRING,
  creator_uid: model.STRING,
  assessor: model.STRING,
  owner: model.STRING,
  created_at: model.STRING,
}, {
  // Sequelize Model config
  timestamps: false
}]

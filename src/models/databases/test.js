// Load Base Model
const model = require('./model')

// Define Test Model
module.exports = {
  id: {
    type: model.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: model.STRING
}

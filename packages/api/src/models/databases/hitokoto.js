// Load Base Model
const model = require('./model')

// Define Database Model
module.exports = [
  {
    id: {
      type: model.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hitokoto: {
      type: model.STRING,
      allowNull: false,
    },
    type: {
      type: model.STRING,
      allowNull: false,
    },
    from: {
      type: model.STRING,
      allowNull: false,
    },
    from_who: {
      type: model.STRING,
      allowNull: true,
    },
    creator: {
      type: model.STRING,
      allowNull: false,
      defaultValue: 'hitokoto',
    },
    creator_uid: {
      type: model.STRING,
      allowNull: true,
    },
    assessor: {
      type: model.STRING,
      allowNull: true,
    },
    owner: {
      type: model.STRING,
      allowNull: false,
    },
    reviewer: {
      type: model.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    uuid: {
      type: model.STRING,
      allowNull: false,
    },
    created_at: {
      type: model.STRING,
      allowNull: false,
    },
  },
  {
    // Sequelize Model config
    timestamps: false,
    freezeTableName: true,
    tableName: 'hitokoto_sentence',
  },
]

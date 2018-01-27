'use strict'
module.exports = {
  index: async (ctx, next) => {
    ctx.body = {
      message: 'Test Controller',
      ts: Date.now()
    }
  }
}

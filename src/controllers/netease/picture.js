// This module is intended to get picture url
const Joi = require('joi')
const crypto = require('crypto')
// validation schema
const { ValidateParams } = require('../../utils/response')
const schema = Joi.object({
  id: Joi.string().required(),
  height: Joi.string().default(300)
})

const md5 = (data) => {
  const buf = Buffer.from(data)
  const str = buf.toString('binary')
  return crypto.createHash('md5').update(str).digest('base64')
}

const neteasePickey = (id) => {
  id = String(id)
  const magic = '3go8&$8*3*3h0k(2)2'.split('')
  const songId = id
    .split('')
    .map((item, index) => String.fromCharCode(
      item.charCodeAt(0) ^ (magic[index % magic.length]).charCodeAt(0)
    ))
  return md5(songId.join(''))
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
}

const picture = (id, size = 300) => {
  return Promise.resolve({
    url: `https://p3.music.126.net/${neteasePickey(id)}/${id}.jpg?param=${size}y${size}`
  })
}

module.exports = async (ctx) => {
  const params = Object.assign({}, ctx.params, ctx.query, ctx.request.body)
  if (!await ValidateParams(params, schema, ctx)) { // validateParams
    return
  }
  const pictureURL = await picture(params.id, params.height)
  ctx.body = pictureURL
}

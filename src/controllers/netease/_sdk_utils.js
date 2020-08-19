// This module contains series utils  of sdk
const crypto = require('crypto')
const {
  RequestFailedException,
  ResponseValidationException,
} = require('./_sdk_exception')

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
    .map((item, index) =>
      String.fromCharCode(
        item.charCodeAt(0) ^ magic[index % magic.length].charCodeAt(0),
      ),
    )
  return md5(songId.join('')).replace(/\//g, '_').replace(/\+/g, '-')
}

const checkResponseStatus = (response) => {
  if (!response) {
    throw new RequestFailedException(
      '响应体不存在，未知错误',
      null,
      'ResponseBodyIsNull',
    )
  }
  if (response.status !== 200) {
    throw new RequestFailedException('请求上游状态码异常，操作失败。', {
      statusCode: response.status,
      responseBody: response.body,
    })
  }
}

const checkAPIResponseData = (data) => {
  if (!data) {
    throw new ResponseValidationException(
      '上游接口返回包体为空，操作失败。',
      null,
      'ResponseNullErr',
    )
  }
  if (data && data.code !== 200) {
    throw new ResponseValidationException(
      '上游接口返回状态码非 200，操作失败。',
    )
  }
}

const APIRemeberCaller = async (func, params) => {
  const body = await func(...params)
  checkAPIResponseData(body)
  return body
}

const SDKRequestGenerator = async (SDKFunc, params) => {
  const response = await SDKFunc(params)
  checkResponseStatus(response)
  return response.body
}

module.exports = {
  neteasePickey,
  checkResponseStatus,
  checkAPIResponseData,
  APIRemeberCaller,
  SDKRequestGenerator,
}

/* eslint-disable no-unused-vars */
// This module contains collections of util that will be used in summary API.
const { getSongsURLs } = require('./_sdk_wrapper')
const getSummery = async (params, isSeriousSearch, realIP = undefined) => {
  const { ids, br, nocache, extraInfo } = params
  if (isSeriousSearch) {
    const { status: statusCode, body: responseBody } = await getSongsURLs(
      ids,
      br,
      realIP,
    )
    if (statusCode !== 200) {
      throw new RequestFailedException(
        '由于请求上游接口失败，无法验证歌曲 IDs。',
        { statusCode, responseBody },
      )
    }
  }
}

const handleResult = async () => {}

class RequestFailedException extends Error {
  constructor(message, detail, type = 'RequestStatusCodeNot200Err') {
    super(message)
    this.detail = detail
    this.type = type
  }
}

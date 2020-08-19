class RequestFailedException extends Error {
  constructor(message, detail, type = 'RequestStatusCodeNot200Err') {
    super(message)
    this.detail = detail
    this.type = type
  }
}

class ResponseValidationException extends Error {
  constructor(message, detail, type = 'ResponseValidationErr') {
    super(message)
    this.detail = detail
    this.type = type
  }
}

module.exports = { RequestFailedException, ResponseValidationException }

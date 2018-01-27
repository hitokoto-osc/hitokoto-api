'use strict'

/**
 * HTTP Status codes
 */
const statusCodes = {
  CONTINUE: 100,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIME_OUT: 504
}

function responseHandler () {
  return async (ctx, next) => {
    ctx.res.statusCodes = statusCodes
    ctx.statusCodes = ctx.res.statusCodes

    ctx.res.success = (data = null, message = null) => {
      ctx.status = ctx.status < 400 ? ctx.status : statusCodes.OK
      ctx.body = { status: 'success', data, message }
    }

    ctx.res.fail = (code = null, message = null, data = null) => {
      ctx.status = ctx.status >= 400 && ctx.status < 500
        ? ctx.status
        : statusCodes.BAD_REQUEST
      ctx.body = { status: 'fail', code, data, message }
    }

    ctx.res.error = (code = null, message = null, data = null) => {
      ctx.status = ctx.status < 500
        ? statusCodes.INTERNAL_SERVER_ERROR
        : ctx.status
      ctx.body = { status: 'error', code, data, message }
    }

    ctx.res.ok = (data, message) => {
      ctx.status = statusCodes.OK
      ctx.res.success(data, message)
    }

    ctx.res.created = (data, message) => {
      ctx.status = statusCodes.CREATED
      ctx.res.success(data, message)
    }

    ctx.res.accepted = (data, message) => {
      ctx.status = statusCodes.ACCEPTED
      ctx.res.success(data, message)
    }

    ctx.res.noContent = (data, message) => {
      ctx.status = statusCodes.NO_CONTENT
      ctx.res.success(data, message)
    }

    ctx.res.badRequest = (code, message, data) => {
      ctx.status = statusCodes.BAD_REQUEST
      ctx.res.fail(code, message, data)
    }

    ctx.res.forbidden = (code, message, data) => {
      ctx.status = statusCodes.FORBIDDEN
      ctx.res.fail(code, message, data)
    }

    ctx.res.notFound = (code, message, data) => {
      ctx.status = statusCodes.NOT_FOUND
      ctx.res.fail(code, message, data)
    }

    ctx.res.unprocessableEntity = (code, message, data) => {
      ctx.status = statusCodes.UNPROCESSABLE_ENTITY
      ctx.res.fail(code, message, data)
    }

    ctx.res.internalServerError = (code, message, data) => {
      ctx.status = statusCodes.INTERNAL_SERVER_ERROR
      ctx.res.error(code, message, data)
    }

    ctx.res.notImplemented = (code, message, data) => {
      ctx.status = statusCodes.NOT_IMPLEMENTED
      ctx.res.error(code, message, data)
    }
    await next()
  }
}

module.exports = responseHandler

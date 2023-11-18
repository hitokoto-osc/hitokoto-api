/* eslint-disable @typescript-eslint/no-explicit-any */
/*!
 * jsonp.js
 * Created by Kilian Ciuffolo on Dec 25, 2013
 * Copyright (c) 2013 Kilian Ciuffolo, me@nailik.org
 */

'use strict'

import iconv from 'iconv-lite'
import { isStream } from 'is-stream'
import type Koa from 'koa'
import type { Stream } from 'node:stream'
import { JSONPStream } from './jsonp-stream'

import { type ReadableStream } from 'node:stream/web'

export interface JSONPOptions {
  callbackName?: string
}

export default function jsonp(options?: JSONPOptions) {
  options = (options || {}) as JSONPOptions
  const callbackName = options.callbackName || 'callback'

  return async function _jsonp(
    ctx: Koa.ParameterizedContext<
      Koa.DefaultState,
      Koa.DefaultContext & {
        query: {
          charset?: string
        }
        app: {
          jsonSpaces?: number
        }
      },
      Buffer | ReadableStream | NodeJS.ReadWriteStream | Stream | string
    >,
    next: Koa.Next,
  ): Promise<any> {
    await next()
    const callback = ctx.query[callbackName]
    if (!ctx.body) {
      return
    }
    if (!callback) {
      if (ctx.query && ctx.query.charset) {
        if (isStream(ctx.body)) {
          if (ctx.query.charset.toLocaleLowerCase() === 'gbk') {
            ctx.type = ctx.type + '; charset=gbk'
            ctx.body = ctx.body.pipe(iconv.decodeStream('utf8')) // encode to gbk
            ctx.body = ctx.body.pipe(iconv.encodeStream('gbk'))
            return
          }
          // ctx.type = 'application/octet-stream'
        } else if (Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string') {
          if (ctx.query.charset.toLocaleLowerCase() === 'gbk') {
            ctx.type = ctx.type + '; charset=gbk'
            ctx.body = iconv.encode(
              Buffer.isBuffer(ctx.body) ? ctx.body.toString() : ctx.body,
              'gbk',
            )
          }
        } else {
          ctx.type = 'application/json'
          ctx.body = JSON.stringify(ctx.body)
          if (ctx.query.charset.toLocaleLowerCase() === 'gbk') {
            ctx.type = ctx.type + '; charset=gbk'
            ctx.body = iconv.encode(ctx.body, 'gbk')
          }
        }
      }
      //  else {
      //   if (isStream(ctx.body)) {
      //     ctx.type = 'application/json'
      //     ctx.body = JSON.stringify(ctx.body)
      //   }
      // }
      return
    }
    if (ctx.body == null) return

    ctx.type = 'text/javascript; charset=utf-8'
    const startChunk = ';' + callback + '('
    const endChunk = ');'

    // handle streams
    if (isStream(ctx.body)) {
      ctx.body = ctx.body.pipe(
        new JSONPStream({
          startChunk,
          endChunk,
        }),
      )
      if (ctx.query && ctx.query.charset) {
        if (ctx.query.charset.toLocaleLowerCase() === 'gbk') {
          ctx.type = 'text/javascript; charset=gbk'
          ctx.body = ctx.body
            .pipe(iconv.decodeStream('utf8'))
            .pipe(iconv.encodeStream('gbk'))
        }
      }
    } else {
      ctx.body =
        startChunk +
        JSON.stringify(ctx.body, null, ctx.app.jsonSpaces || 2) +
        endChunk

      // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
      ctx.body = ctx.body
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
      if (ctx.query && ctx.query.charset) {
        if (ctx.query.charset.toLocaleLowerCase() === 'gbk') {
          ctx.body = iconv.encode(ctx.body, 'gbk')
          ctx.type = 'text/javascript; charset=gbk'
        }
      }
    }
  }
}

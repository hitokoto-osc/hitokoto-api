import { createReadStream } from 'node:fs'
import path from 'node:path'

import { getRandomPort } from 'get-port-please'
import iconv from 'iconv-lite'
import JSONStream from 'jsonstream-next'
import Koa from 'koa'
import mount from 'koa-mount'
import http from 'node:http'
import { ofetch, type $Fetch } from 'ofetch'
import enableDestroy from 'server-destroy'
import stringify from 'streaming-json-stringify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import jsonp from '../src/index'

let server: http.Server
let port: number
let fetch: $Fetch
describe('jsonp()', () => {
  beforeAll(async () => {
    const app = new Koa()
    app.use(jsonp({ callbackName: 'my_cb_name' }))
    app.use(
      mount('/buffered', async function (ctx) {
        ctx.body = { foo: 'bar', test: '中文' }
      }),
    )
    app.use(
      mount('/string', async function (ctx) {
        ctx.body = '测试'
      }),
    )
    app.use(
      mount('/null', async function (ctx) {
        ctx.body = null
      }),
    )
    app.use(
      mount('/streaming', async function (ctx) {
        ctx.body = createReadStream(path.join(__dirname, 'stream.json'))
          .pipe(JSONStream.parse('rows.*.value'))
          .pipe(stringify())
      }),
    )
    port = await getRandomPort()
    fetch = ofetch.create({ baseURL: `http://localhost:${port}` })
    server = http.createServer(app.callback()).listen(port)
    enableDestroy(server)
  })

  afterAll(() => {
    server.destroy()
  })

  test("shouldn't do anything if callback is not provided / GET", async function () {
    const res = await fetch.raw('/buffered', {
      responseType: 'json',
    })
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    )
    expect(res._data.foo).toBe('bar')
  })

  test("shouldn't do anything if callback is not provided / GET / Stream", async function () {
    const res = await fetch.raw('/streaming', {
      responseType: 'json',
    })
    // console.log(res._data)
    expect(res._data).toHaveLength(5)
    expect(res.headers.get('content-type')).toBe('application/octet-stream')
  })

  test("shouldn't do anything if callback is not provided / POST", async function () {
    const res = await fetch.raw('/buffered', {
      method: 'POST',
      responseType: 'json',
    })
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    )
    expect(res._data.foo).toBe('bar')
  })

  test("shouldn't do anything if this.body is undefined", async function () {
    const res = await fetch.raw('/404?my_cb_name=cb', {
      responseType: 'text',
      ignoreResponseError: true,
    })
    expect(res._data).toBe('Not Found')
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  })

  test("shouldn't do anything if this.body is null", async function () {
    const res = await fetch.raw('/null?my_cb_name=cb')
    expect(res.body).toBe(null)
    expect(res.status).toBe(204)
  })

  test('should switch to JSONP mode if this.body is defined', async function () {
    const res = await fetch.raw('/buffered?my_cb_name=cb', {
      responseType: 'text',
    })
    expect(res._data).toBeTypeOf('string')
    expect(res._data?.length).toBeGreaterThan(0)
    const data = JSON.parse(res._data!.match(/cb\(([^)]+)\)/m)![1])
    expect(data.foo).toBe('bar')
    expect(res.headers.get('content-type')).toBe(
      'text/javascript; charset=utf-8',
    )
  })

  test('should switch to JSONP mode if callback is provided / GET / Stream', async function () {
    const res = await fetch.raw('/streaming?my_cb_name=cb', {
      responseType: 'text',
    })
    expect(res._data).toBeTypeOf('string')
    expect(res._data?.length).toBeGreaterThan(0)
    const data = JSON.parse(res._data!.match(/cb\(([^)]+)\)/m)![1])
    expect(data).toHaveLength(5)
    expect(res.headers.get('content-type')).toBe(
      'text/javascript; charset=utf-8',
    )
  })

  test('should return gbk charset if charset is gbk / GET ', async function () {
    const res = await fetch.raw('/buffered?charset=gbk', {
      responseType: 'blob',
    })
    expect(res._data).toBeTypeOf('object')
    const str = iconv.decode(Buffer.from(await res._data!.arrayBuffer()), 'gbk')
    expect(str).toMatch(/中文/)
    expect(res.headers.get('content-type')).toBe(
      'application/json; charset=gbk',
    )
  })

  test('should return gbk charset and callback if charset is gbk and cb is cb / GET ', async function () {
    const res = await fetch.raw('/buffered?my_cb_name=cb&charset=gbk', {
      responseType: 'blob',
    })
    expect(res._data).toBeTypeOf('object')
    const str = iconv.decode(Buffer.from(await res._data!.arrayBuffer()), 'gbk')
    expect(str).toMatch(/cb/)
    expect(str).toMatch(/中文/)
    expect(res.headers.get('content-type')).toBe('text/javascript; charset=gbk')
  })

  test('should return gbk charset if charset is gbk / GET / Stream ', async function () {
    const res = await fetch.raw('/streaming?charset=gbk', {
      responseType: 'blob',
    })
    const str = iconv.decode(Buffer.from(await res._data!.arrayBuffer()), 'gbk')
    expect(str).toMatch(/中文/)
    expect(res.headers.get('content-type')).toBe(
      'application/octet-stream; charset=gbk',
    )
  })

  test('should return gbk charset if charset is gbk / GET / Stream and has a cb function', async function () {
    const res = await fetch.raw('/streaming?my_cb_name=cb&charset=gbk', {
      responseType: 'blob',
    })
    const str = iconv.decode(Buffer.from(await res._data!.arrayBuffer()), 'gbk')
    expect(JSON.parse(str.replace(';cb(', '').replace(');', ''))).toBeTypeOf(
      'object',
    )
    expect(str).toMatch(/中文/)
    expect(res.headers.get('content-type')).toBe('text/javascript; charset=gbk')
  })

  test('should return gbk charset if charset is gbk / GET / String ', async function () {
    const res = await fetch.raw('/string?charset=gbk', {
      responseType: 'blob',
    })
    const str = iconv.decode(Buffer.from(await res._data!.arrayBuffer()), 'gbk')
    expect(str).toMatch(/测试/)

    expect(res.headers.get('content-type')).toBe('text/plain; charset=gbk')
  })
})

/* eslint-disable @typescript-eslint/no-explicit-any */
/*!
 * jsonp-stream.js
 * Created by Kilian Ciuffolo on Dec 25, 2013
 * Copyright (c) 2013 Kilian Ciuffolo, me@nailik.org
 */

import {
  Transform,
  TransformCallback,
  type TransformOptions,
} from 'node:stream'

export interface JSONPStreamOptions {
  startChunk?: string
  endChunk?: string
  started?: boolean
}

export class JSONPStream extends Transform {
  startChunk: string
  endChunk: string
  started: boolean
  start = ';'
  constructor(options?: (TransformOptions & JSONPStreamOptions) | undefined) {
    super({ objectMode: true })

    options = options || {}
    this.startChunk = options.startChunk || ''
    this.endChunk = options.endChunk || ''
    this.destroyed = false
    this.started = false
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.destroyed) return

    if (!this.started) {
      this.started = true
      this.push(this.startChunk)
    }

    /* TODO */
    // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
    // data = data.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    this.push(chunk)

    process.nextTick(callback)
  }

  _flush(callback: TransformCallback): void {
    if (this.destroyed) return

    if (!this.started) {
      this.push(this.startChunk)
    }

    this.push(this.endChunk)
    this.push(null)

    process.nextTick(callback)
  }

  destroy() {
    if (!this.destroyed) {
      this.emit('close')
      this.destroyed = true
    }
    return super.destroy()
  }
}

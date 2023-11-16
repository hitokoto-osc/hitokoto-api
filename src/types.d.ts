import * as Koa from 'koa'

// Utils type

export type NullValue = null | undefined | void

// Routes related types

export type RouteHandler = (ctx: Koa.Context, next: Koa.Next) => Promise<any>

export type Plugin = [string, RouteHandler]

export type Plugins = Array<Plugin | NullValue>

// This is a esm router module type definition
export namespace Controller {
  export const middlewares: Plugins | undefined // middlewares that should be applied to this controller
  export const GET: RouteHandler | undefined
  export const POST: RouteHandler | undefined
  export const PUT: RouteHandler | undefined
  export const DELETE: RouteHandler | undefined
  export const PATCH: RouteHandler | undefined
  export const OPTIONS: RouteHandler | undefined
  export const HEAD: RouteHandler | undefined
  export const ALL: RouteHandler | undefined
  export const TRACE: RouteHandler | undefined
}

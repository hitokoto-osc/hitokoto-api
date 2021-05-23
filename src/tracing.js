const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const nconf = require('nconf')
// Init Sentry Server
Sentry.init({
  dsn: 'https://9e3019aa154c45ba8affa9a34c7fe162@o673612.ingest.sentry.io/5768310',
  release: 'hitokoto-api@v' + nconf.get('version'),
  tracesSampleRate: 0.001,
})

module.exports = {
  Sentry,
  Tracing,
}

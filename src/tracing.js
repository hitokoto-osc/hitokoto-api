const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

// Init Sentry Server
Sentry.init({
  dsn: 'https://9e3019aa154c45ba8affa9a34c7fe162@o673612.ingest.sentry.io/5768310',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

module.exports = {
  Sentry,
  Tracing,
}

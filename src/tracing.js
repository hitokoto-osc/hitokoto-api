const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const nconf = require('nconf')
const os = require('os')
const isTelemetryErrorEnabled = nconf.get('telemetry:error')
const isTelemetryPerformanceEnabled = nconf.get('telemetry:performance')
// Init Sentry Server
Sentry.init({
  dsn:
    isTelemetryErrorEnabled && isTelemetryPerformanceEnabled
      ? 'https://9e3019aa154c45ba8affa9a34c7fe162@o673612.ingest.sentry.io/5768310'
      : false,
  release: 'hitokoto-api@v' + nconf.get('version'),
  tracesSampler(samplingContext) {
    return 0.0001 // default rate
  },
  attachStacktrace: true,
  serverName: nconf.get('name') || os.hostname(),
  environment: nconf.get('dev') ? 'development' : 'production',
})

module.exports = {
  Sentry,
  Tracing,
}

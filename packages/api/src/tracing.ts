import {
  Dedupe as DedupeIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  Transaction as TransactionIntegration,
} from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import nconf from 'nconf'
import os from 'node:os'
export * as Tracing from '@sentry/tracing'
const isTelemetryErrorEnabled = !!nconf.get('telemetry:error')
const isTelemetryPerformanceEnabled = !!nconf.get('telemetry:performance')

// Init Sentry Server
if (isTelemetryErrorEnabled && isTelemetryPerformanceEnabled) {
  Sentry.init({
    debug: !!nconf.get('telemetry:debug') || false,
    dsn: 'https://9e3019aa154c45ba8affa9a34c7fe162@o673612.ingest.sentry.io/5768310',
    release: 'hitokoto-api@v' + nconf.get('version'),
    tracesSampler(samplingContext) {
      return 0.0001 // default rate
    },
    attachStacktrace: true,
    integrations: function (integrations) {
      return integrations
        .filter((integration) => {
          // TODO: 也许未来可以在这里进行全局捕获？
          return integration.name !== 'OnUncaughtException' // 禁止默认的错误捕获行为
        })
        .concat([
          new Sentry.Integrations.LinkedErrors(),
          new DedupeIntegration(),
          new ExtraErrorDataIntegration(),
          new TransactionIntegration(),
        ])
    },
    serverName: nconf.get('api_name') || os.hostname(),
    environment: nconf.get('dev') ? 'development' : 'production',
  })
}

export * as Sentry from '@sentry/node'

export function CaptureUncaughtException(error: Error) {
  const hub = Sentry.getCurrentHub()
  hub.withScope((scope) => {
    scope.setLevel('fatal')
    hub.captureException(error, {
      originalException: error,
      data: { mechanism: { handled: false, type: 'onUncaughtException' } },
    })
  })
}

const compact = require('lodash.compact')
const curry = require('lodash.curry')
const utils = {}

const DEFAULT_PROPERTIES = [
  'name',
  'message',
  'stack',
  'type'
]

const toErrorObject = curry((err, acum, propertyName) => {
  return err[propertyName] ? Object.assign({}, acum, {
    [propertyName]: err[propertyName]
  }) : acum
})

const DEFAULT_FORMATTING_PIPELINE = Object.freeze({
  // Set all enumerable properties of error onto the object
  preFormat: err => Object.assign({}, err),
  // Add default custom properties to final error object
  format: function (err, preFormattedError) {
    const formattedError = DEFAULT_PROPERTIES.reduce(toErrorObject(err), {})
    return Object.assign({}, preFormattedError, formattedError, {
      status: err.status || err.statusCode || 500
    })
  },
  // Final transformation after `options.format` (defaults to no op)
  postFormat: null
})
// Extend options with default values
const formatters = Object.assign({}, DEFAULT_FORMATTING_PIPELINE)

const formattingPipeline = compact([
  formatters.preFormat,
  formatters.format,
  formatters.postFormat
])

const applyFormat = curry((err, acum, formatter) => formatter(err, acum))

/**
 * Apply all ordered formatting functions to original error.
 * @param  {Error} err The thrown error.
 * @return {Object}    The JSON serializable formatted object.
 */
utils.formatError = err => {
  return formattingPipeline.reduce(applyFormat(err), {})
}

utils.htmlEscape = text => {
  return text.replace(/[<>"&]/g, function (match, pos, originalText) {
    switch (match) {
      case '<': return '&lt;'
      case '>':return '&gt;'
      case '&':return '&amp;'
      case '"':return '&quot;'
    }
  })
}
module.exports = utils

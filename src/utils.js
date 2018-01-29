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

utils.JSONtoHTML = (json, options) => {
  let reg = null
  let formatted = ''
  let pad = 0
  let PADDING = '    '
  options = options || {}
  options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true)
  options.spaceAfterColon = options.spaceAfterColon !== false
  if (typeof json !== 'string') {
    json = JSON.stringify(json)
  } else {
    json = JSON.parse(json)
    json = JSON.stringify(json)
  }
  reg = /([\{\}])/g
  json = json.replace(reg, '\r\n$1\r\n')
  reg = /([\[\]])/g
  json = json.replace(reg, '\r\n$1\r\n')
  reg = /(\,)/g
  json = json.replace(reg, '$1\r\n')
  reg = /(\r\n\r\n)/g
  json = json.replace(reg, '\r\n')
  reg = /\r\n\,/g
  json = json.replace(reg, ',')
  if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
    reg = /\:\r\n\{/g
    json = json.replace(reg, ':{')
    reg = /\:\r\n\[/g
    json = json.replace(reg, ':[')
  }
  if (options.spaceAfterColon) {
    reg = /\:/g
    json = json.replace(reg, ':')
  }
  (json.split('\r\n')).forEach(function (node, index) {
    let i = 0
    let indent = 0
    let padding = ''

    if (node.match(/\{$/) || node.match(/\[$/)) {
      indent = 1
    } else if (node.match(/\}/) || node.match(/\]/)) {
      if (pad !== 0) {
        pad -= 1
      }
    } else {
      indent = 0
    }

    for (i = 0; i < pad; i++) {
      padding += PADDING
    }

    formatted += padding + node + '\r\n'
    pad += indent
  }
  )
  return formatted
}
module.exports = utils

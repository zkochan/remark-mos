'use strict'
module.exports = attacher

const visit = require('async-unist-util-visit')
const createAsyncScopeEval = require('./create-async-scope-eval')

function createInsertBlock (code, body) {
  const bodyWithNL = body ? `\n${body}\n` : body
  return `<!--@${code}-->${bodyWithNL}<!--/@-->`
}

const template = new RegExp('^<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--/@-->')

function markdownScript (eat, value, silent) {
  if (!template.exec(value)) return

  const match = matchRecursive(value, '<!--@([\\s\\S]+?)-->', '<!--/@-->')

  if (match) {
    if (silent) return true

    return eat(match[0])({
      type: 'markdownScript',
      code: match[1],
    })
  }
}

function matchRecursive (str, opener, closer) {
  const iterator = new RegExp('(<!--@([\\s\\S]+?)-->)|(<!--/@-->)', 'g')
  let openTokens, matchStartIndex, match

  do {
    openTokens = 0
    let firstMatch
    let code
    while ((match = iterator.exec(str))) {
      if (~match[0].indexOf('<!--@')) {
        if (!openTokens) {
          matchStartIndex = iterator.lastIndex
          firstMatch = match[0]
          code = match[2]
        }
        openTokens++
        continue
      }
      if (openTokens) {
        openTokens--
        if (!openTokens) {
          return [firstMatch + str.slice(matchStartIndex, match.index) + match[0], code]
        }
      }
    }
  } while (openTokens && (iterator.lastIndex = matchStartIndex))
}

markdownScript.locator = (value, fromIndex) => value.indexOf('<!--@', fromIndex)

function attacher (remark, opts) {
  opts = opts || {}

  const proto = remark.Parser.prototype
  const methods = proto.inlineMethods
  const blockMethods = proto.blockMethods
  remark.Compiler.prototype.visitors.markdownScript = node => createInsertBlock(node.code, node.body)

  proto.inlineTokenizers.markdownScript = markdownScript
  proto.blockTokenizers.markdownScript = markdownScript

  methods.splice(0, 0, 'markdownScript')
  blockMethods.splice(0, 0, 'markdownScript')

  const asyncScopeEval = createAsyncScopeEval(opts.scope)

  return (ast, file) => visit(ast, 'markdownScript', visitor)

  function visitor (node) {
    return asyncScopeEval(node.code)
      .catch(err => {
        const wraperr = new Error(`Failed to execute template code at line ${node.position.start.line} with '${err.message}'`)
        wraperr.initialError = err
        throw wraperr
      })
      .then(body => { node.body = body })
  }
}

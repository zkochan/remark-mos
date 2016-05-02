'use strict'
module.exports = attacher

const createAsyncScopeEval = require('./create-async-scope-eval')

const template = new RegExp('^<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--/@-->')

function matchRecursive (str) {
  const iterator = new RegExp('(<!--@([\\s\\S]+?)-->)|(<!--/@-->)', 'g')
  let openTokens, matchStartIndex, match

  do {
    openTokens = 0
    let firstMatch
    let code
    while ((match = iterator.exec(str))) {
      const inside = str.slice(matchStartIndex, match.index)
      const insideFencedBlock = (inside.match(/```/g) || []).length % 2 !== 0
      if (insideFencedBlock) continue

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
          return [firstMatch + inside + match[0], code]
        }
      }
    }
  } while (openTokens && (iterator.lastIndex = matchStartIndex))
}

function attacher (remark, opts) {
  opts = opts || {}

  const proto = remark.Parser.prototype

  function markdownScript (eat, value, silent) {
    if (!template.exec(value)) return

    const match = matchRecursive(value)

    if (match) {
      if (silent) return true

      return asyncScopeEval(match[1])
        .catch(err => {
          const wraperr = new Error(`Failed to execute template code at line ${eat.now().line} with '${err.message}'`)
          wraperr.initialError = err
          throw wraperr
        })
        .then(ast => {
          if (ast instanceof Array) return ast
          if (typeof ast === 'object') return [ast]
          return this.tokenizeBlock(ast.toString())
        })
        .then(children => eat(match[0])({
          type: 'markdownScript',
          code: match[1],
          children,
        }))
    }
  }

  markdownScript.locator = (value, fromIndex) => value.indexOf('<!--@', fromIndex)

  const methods = proto.inlineMethods
  const blockMethods = proto.blockMethods
  remark.Compiler.prototype.visitors.markdownScript = function (node) {
    const body = this.block(node)
    let bodyWithNL = body ? `\n${body}\n` : body
    if (node.children && node.children.length && node.children[node.children.length - 1].type === 'list') {
      bodyWithNL += '\n'
    }
    return `<!--@${node.code}-->${bodyWithNL}<!--/@-->`
  }

  proto.inlineTokenizers.markdownScript = markdownScript
  proto.blockTokenizers.markdownScript = markdownScript

  methods.splice(0, 0, 'markdownScript')
  blockMethods.splice(0, 0, 'markdownScript')

  const asyncScopeEval = createAsyncScopeEval(opts.scope)
}

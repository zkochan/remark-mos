'use strict'
const remark = require('@zkochan/remark')
const remarkMos = require('.')

const scope = {
  foo: () => 'Hello world!',
}

const processor = remark.use(remarkMos, { scope, useStrict: true })

const markdown = '<!--@foo()--><!--/@-->'
processor.process(markdown).then(res => console.log(res.result))

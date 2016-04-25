'use strict'
const remark = require('remark')
const remarkMos = require('.')

const scope = {
  foo: () => 'Hello world!',
}

const processor = remark.use(remarkMos, {scope})

const markdown = '<!--@foo()--><!--/@-->'
processor.process(markdown, (err, newmd) => {
  if (err) {
    console.log(err)
    return
  }
  console.log(processor.stringify(newmd))
})

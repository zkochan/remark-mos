'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const remark = require('@zkochan/remark')
const remarkMos = require('.')

function createProcessor (scope) {
  return remark().use(remarkMos, {scope})
}

function createProcess (scope) {
  return md => createProcessor(scope)
    .process(md)
    .then(res => res.result)
}

describe('mos', () => {
  it('should insert value to markdown when no value in the placeholder', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('Insert <!--@package.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value to markdown when the plugin returns a promise', () => {
    const process = createProcess({
      asyncFoo: () => Promise.resolve('foo'),
    })
    return process('Insert <!--@asyncFoo()--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@asyncFoo()-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value to markdown when there is already a value in the placeholder', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('Insert <!--@package.name-->bar<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value with newline to markdown', () => {
    const process = createProcess({
      package: {
        name: 'new\nvalue',
      },
    })
    return process('Insert <!--@package.name-->old\nvalue<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nnew\nvalue\n<!--/@--> here\n')
      })
  })

  it('should execute javascript and insert into the markup', () => {
    const process = createProcess()
    return process('Insert <!--@ 1 + 2 --><!--/@--> here')
      .then(newMD => expect(newMD).to.eq('Insert <!--@ 1 + 2 -->\n3\n<!--/@--> here\n'))
  })

  it('should execute javascript when it contains newlines', () => {
    const process = createProcess()
    return process('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n'))
  })

  it('should match several inputs', () => {
    const process = createProcess()
    return process('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere\n\n<!--@"Hello world!"-->"Hello world!"<!--/@-->\n')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n\n<!--@"Hello world!"-->\nHello world!\n<!--/@-->\n'))
  })

  it('should not insert value to markdown comments that are inside code blocks', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('Do not insert\n``` md\n<!--@package.name--><!--/@-->\n```\nhere')
      .then(newMD => {
        expect(newMD).to.eq('Do not insert\n\n```md\n<!--@package.name--><!--/@-->\n```\n\nhere\n')
      })
  })

  it('should insert value to markdown when comments are after code blocks', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('```\nInsert\n```\n\n<!--@package.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('    Insert\n\n<!--@package.name-->\nfoo\n<!--/@-->\n\n here\n')
      })
  })

  it('should throw exception when error during template code execution', done => {
    const process = createProcess()
    return process('<!--@1/--><!--/@-->')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        expect(err.message).to.match(/Failed to execute template code at line 1/)
        done()
      })
  })

  it('should insert value to markdown and override nested markdown scripts', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('Insert <!--@package.name--><!--@package.name--><!--/@--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should ignore closing tag that is inside a fenced block', () => {
    const process = createProcess({
      package: {
        name: 'foo',
      },
    })
    return process('<!--@package.name-->\n```\n<!--/@-->\n```\n<!--/@-->')
      .then(newMD => {
        expect(newMD).to.eq('<!--@package.name-->\nfoo\n<!--/@-->\n')
      })
  })

  it('should insert value to markdown and override nested markdown scripts that are inside fenced blocks', () => {
    const process = createProcess()
    return process('<!--@"foo"-->\n```\n<!--@package.name--><!--/@-->\n```\n<!--/@-->')
      .then(newMD => {
        expect(newMD).to.eq('<!--@"foo"-->\nfoo\n<!--/@-->\n')
      })
  })

  it('should insert convert AST to markdown and insert it', () => {
    const process = createProcess({
      ast: {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'foo',
          },
        ],
      },
    })
    return process('Insert <!--@ ast --><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@ ast -->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert additional break after list', () => {
    const process = createProcess({
      ast: {
        type: 'list',
        ordered: false,
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'text',
                value: 'foo',
              },
            ],
          },
        ],
      },
    })
    return process('Insert <!--@ ast --><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@ ast -->\n-   foo\n\n<!--/@--> here\n')
      })
  })
})

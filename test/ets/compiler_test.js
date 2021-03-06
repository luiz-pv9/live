const Compiler = require('../../src/ets/compiler')
const expect = require('chai').expect

describe('Compiler specs', () => {
  let compiler
  
  beforeEach(() => {
    compiler = new Compiler()
  })

  it('inline', () => {
    let tpl = compiler.inline('<div>foo</div>')
    let str = tpl()
    expect(str).to.eq('<div>foo</div>')
  })

  it('locals', () => {
    let tpl = compiler.inline('<div><%= @name %></div>')
    let str = tpl({name: 'Luiz'})
    expect(str).to.eq('<div>Luiz</div>')
  })

  it('escapes html', () => {
    let tpl = compiler.inline('<div><%= @name %></div>')
    let str = tpl({name: '<b>Luiz</b>'})
    expect(str).to.eq('<div>&lt;b&gt;Luiz&lt;/b&gt;</div>')
  })

  it('outputs raw html', () => {
    let tpl = compiler.inline('<%= raw("<b>Luiz</b>") %>')
    let str = tpl()
    expect(str).to.eq('<b>Luiz</b>')
  })

  it('handles error', () => {
    let tpl = compiler.inline(`
      <div><%= name.length %></div>
    `)
    try {
      let str = tpl({ name: null })
    } catch(err) {
      expect(err).to.be.ok
      expect(err.templateLineNumber).to.eq(1)
      expect(err.templateColumnNumber).to.eq(21)
    }
  })

  it('handles error with correct multiple lines', () => {
    let tpl = compiler.inline(`
      <div>
        <%= name.length %>
      </div>
    `)
    try {
      let str = tpl({ name: null })
    } catch(err) {
      expect(err.templateLineNumber).to.eq(2)
      expect(err.templateColumnNumber).to.eq(18)
    }
  })
})
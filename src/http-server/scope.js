const httpMethods = require('./http-methods')

class Scope {
  constructor(dispatcher) {
    this.dispatcher = dispatcher
    this.steps = []
    this.inheritedPrefix = ''
    this.pathPrefix = ''

    httpMethods.forEach(method => {
      this[method] = (path, callback) => {
        path = this.inheritedPrefix + this.pathPrefix + path
        this.dispatcher.match([method], path, this.wrapCallback(callback))
      }
    })
  }

  wrapCallback(callback) {
    return conn => {
      let pipeline = this.steps.reduce((promise, step) => {
        return promise.then(conn => { return step(conn) })
      }, Promise.resolve(conn))

      return pipeline.then(conn => {
        return callback(conn)
      })
    }
  }

  pipe(step) {
    this.steps.push(step)
  }

  prefix(prefix) {
    if(!prefix.endsWith('/')) {
      prefix += '/'
    }
    this.pathPrefix = prefix
  }

  group(callback) {
    let scope = new Scope(this.dispatcher)
    scope.inheritedPrefix = this.inheritedPrefix + this.pathPrefix
    scope.steps = this.steps.slice()
    callback(scope)
  }
}

module.exports = Scope
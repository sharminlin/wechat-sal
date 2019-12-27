import { BUS_EVENT_NAME } from './eventBus'
import {
  handleNavigateTo
} from './handlers'
import { watch, normalizeWatch, runnerWatch } from './watch'
import { isObject, isFunc } from './tool'
import regeneratorRuntime from './runtime'

// 必要的方法拦截
const proxyHooksMap = {}
// 内置-方法拦截
const proxyBuiltInHooksMap = {
  'onLoad': function () {
    runnerWatch(this)
  },
  'watch': beforeWatch
}

// 内置-需要先在选项中定义的方法的拦截
const proxyDefinedHooksMap = {
  // 'computed': beforeComputed
}

class CreatePage {
  constructor (hooks) {
    this.globalMixins = {}
    this.proxyHooksMap = {}
    for (let key in hooks) {
      this.proxyHooksMap[key] = getHooks(key, hooks[key])
    }
  }

  page = (options) => {
    const proxyHooksMap = this.proxyHooksMap
    const globalMixins = this.globalMixins

    // 执行拦截代理hooks
    for (let key in proxyHooksMap) {
      proxyHooksMap[key](options)
    }

    // 未在hooks中的
    Object.keys(options).map(key => {
      if (proxyDefinedHooksMap[key]) {
        proxyDefinedHooksMap[key](options)
      }
    })

    for (let key in globalMixins) {
      options[key] = globalMixins[key]
    }

    return Page(options)
  }

  mixins = (globalMixins) => {
    this.globalMixins = {
      ...this.globalMixins,
      ...globalMixins
    }
  }
}


/**
 * 设置通用的data数据
 */
function beforeData (next, fn) {
  next.data = Object.assign({}, fn(), next.data)
}

// function beforeComputed (preOpt, nextOpt) {
//   const computedOption = preOpt.computed
//   if (computedOption) {
//     Object.keys(computedOption).map(key => {
//       nextOpt.data[key] = computed(computedOption[key].bind(nextOpt))
//     })
//   }
// }

function beforeWatch (next) {
  next.watch = normalizeWatch(next)
  next.$watchSet = watch()
}

function getHooks (name, fn) {
  return function (next) {
    if (name === 'data') {
      beforeData(next, fn)
    } else {
      replaceHooks(name, next, fn)
    }
  }
}

function replaceHooks (name, next, fn) {
  const preFn = next[name] // change
  next[name] = async function (...args) {
    let option = normalizeHook(fn)

    if (option.async) {
      await option.handler.call(this, ...args)
    } else {
      option.handler.call(this, ...args)
    }
    proxyBuiltInHooksMap[name] && proxyBuiltInHooksMap[name].call(this)
    return preFn && preFn.call(this, ...args)
  }
}

function normalizeHook (fn) {
  if (isObject(fn)) {
    return fn
  } else if (isFunc(fn)) {
    return {
      handler: fn,
      async: false
    }
  } else {
    throw new Error('fn is not valided')
  }
}

export default CreatePage

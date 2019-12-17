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
  }
}
// 内置-需要先在选项中定义的方法的拦截
const proxyDefinedHooksMap = {
  // 'computed': beforeComputed,
  'watch': beforeWatch
}

const createPage = function (hooks) {
  // 执行拦截代理hooks
  for (let key in hooks) {
    proxyHooksMap[key] = getHooks(key, hooks[key])
  }

  return _Page
}

function _Page (options) {
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

  options.handleNavigateTo = handleNavigateTo

  return Page(options)
}

/**
 * 设置通用的data数据
 */
function beforeData (next, fn) {
  next.data = Object.assign({}, fn(), next.data)
}

/* 
 * 设置onLoad拦截方法
 * --- func 1. 管理登录回调
 */
function beforeOnLoad (preOpt, nextOpt) {
  // onLoad之前执行此方法
  function _beforeOnLoad (cb, ...args) {
    const app = getApp()
    if (!app.hasLogin) {
      app.$bus.$on(BUS_EVENT_NAME.appLaunchLogin, () => {
        cb && cb.call(this, ...args)
        runnerWatch(this)
      })
    } else {
      cb && cb.call(this, ...args)
      runnerWatch(this)
    }
  }

  beforeFunc('onLoad', preOpt, nextOpt, _beforeOnLoad)
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
    let option = normalizeHandler(fn)

    if (option.async) {
      await option.handler.call(this, ...args)
    } else {
      option.handler.call(this, ...args)
    }
    proxyBuiltInHooksMap[name] && proxyBuiltInHooksMap[name].call(this)
    return preFn && preFn.call(this, ...args)
  }
}

function normalizeHandler (fn) {
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

export default createPage

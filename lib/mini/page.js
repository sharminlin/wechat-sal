import { BUS_EVENT_NAME } from './eventBus'
import {
  handleNavigateTo
} from './handlers'
import { watch, normalizeWatch, runnerWatch } from './watch'

// 必要的方法拦截
const proxyHooksMap = {
  'data': beforeData,
  'onLoad': beforeOnLoad
}

// 内置-需要先在选项中定义的方法的拦截
const proxyDefinedHooksMap = {
  // 'computed': beforeComputed,
  'watch': beforeWatch
}

const createPage = function (hooks) {

}

const _Page = (options) => {
  // 拦截产生的新PAGE选项
  const _options = {
    handleNavigateTo
  }

  // 执行拦截代理hooks
  for (let key in proxyHooksMap) {
    proxyHooksMap[key](options, _options)
  }

  // 未在hooks中的
  Object.keys(options).map(key => {
    if (proxyDefinedHooksMap[key]) {
      proxyDefinedHooksMap[key](options, _options)
    } else if (!proxyHooksMap[key]) {
      _options[key] = options[key]
    }
  })

  return Page(_options)
}

/**
 * 设置通用的data数据
 */
function beforeData (preOpt, nextOpt) {
  const app = getApp()

  nextOpt.data = Object.assign({}, preOpt.data, {
    qiniuHost: app.globalData.qiniuHost, // 通用七牛云服务器地址
    qPrefix: app.globalData.qPrefix,
    imgPrefix: app.globalData.imgPrefix,
    host: app.globalData.host // 服务器地址
  })
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

function beforeWatch (preOpt, nextOpt) {
  nextOpt.watch = normalizeWatch(preOpt, nextOpt)
  nextOpt.$watchSet = watch(preOpt, nextOpt)
}

function beforeFunc (name, pre, next, fn) {
  next[name] = function (...args) {
    return fn.call(this, pre[name], ...args)
  }
}

export default createPage

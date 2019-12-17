import createPage from './page'
import EventBus from './eventBus'
import path from './path'
import { watch, normalizeWatch, runnerWatch } from './watch'

export default {
  createPage: createPage(before),
  EventBus,
  ...path
}

const app = getApp()

const before = {
  beforeData () {
    return {
      qiniuHost: app.globalData.qiniuHost, // 通用七牛云服务器地址
      qPrefix: app.globalData.qPrefix,
      imgPrefix: app.globalData.imgPrefix,
      host: app.globalData.host
    }
  },

  beforeOnLoad () {
    return new Promise(resolve) {
      if (!app.hasLogin) {
        app.$bus.$on(BUS_EVENT_NAME.appLaunchLogin, () => {
          resolve()
        })
      } else {
        resolve()
      }
    }
  },

  beforeOnShow () {
    console.log(this.data.count)
  }
}

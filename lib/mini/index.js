import createPage from './page'
import EventBus, { BUS_EVENT_NAME } from './eventBus'
import path from './path'
const app = getApp()

const before = {
  data () {
    return {
      qiniuHost: app.globalData.qiniuHost, // 通用七牛云服务器地址
      qPrefix: app.globalData.qPrefix,
      imgPrefix: app.globalData.imgPrefix,
      host: app.globalData.host
    }
  },

  onLoad: {
    handler: function () {
      return new Promise(resolve => {
        if (!app.hasLogin) {
          app.$bus.$on(BUS_EVENT_NAME.appLaunchLogin, () => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    },
    async: true
  },

  onShow () {
    console.log(this.data.count)
  }
}

export default {
  CreatePage: createPage(before),
  EventBus,
  ...path
}

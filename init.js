import { CreatePage } from './lib/mini/index'

// app使用到的BUS事件名归类
export const BUS_EVENT_NAME = {
  'appLaunchLogin': 'APP_LAUNCH_LOGIN', // app首次进入登录时产生的异步事件
}

function createPage () {
  const options = {
    data () {
      const app = getApp()
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
          const app = getApp()
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
      this.setData({
        a: 1
      })
      console.log(this.data.count)
    }
  }

  const page = new CreatePage(options)
  page.mixins({
    handleNavigate: function () {}
  })
  return page
}

export default createPage

import { CreatePage } from '../lib/mini/index'
import {
  handleNavigateTo
} from './handlers'
import { BUS_EVENT_NAME } from '../utils/constant'
import { getUrlAndQuery, getPagePath } from '../utils/query'
import { recordPageVisitLog, sendPageVisitLog } from './fineIO'

function createPage () {
  const page = new CreatePage({
    data () {
      return {
        qiniuHost: getApp().globalData.qiniuHost, // 通用七牛云服务器地址
        qPrefix: getApp().globalData.qPrefix,
        imgPrefix: getApp().globalData.imgPrefix,
        host: getApp().globalData.host
      }
    },
  
    onLoad: {
      beforeHandler: function () {
        return new Promise(resolve => {
          if (!getApp().hasLogin) {
            getApp().$bus.$on(BUS_EVENT_NAME.appLaunchLogin, () => {
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
      recordPageVisitLog()
    },

    onHide () {
      getApp().$bus.$off(BUS_EVENT_NAME.sessionShopId)
      sendPageVisitLog(this)
    },

    onUnload () {
      sendPageVisitLog(this)
    },

    onShareAppMessage: {
      afterHandler (result) {
        let shareInfo = result || { path: getPagePath() }
        let shareid = wx.getStorageSync('userid') || ''
        let { path, query } = getUrlAndQuery(shareInfo.path)
        shareInfo.path = `${path}?shareid=${shareid}&${query}`;
        console.log(shareInfo)
        return shareInfo
      }
    }
  })

  page.mixins({
    handleNavigateTo
  })

  return page
}

export default createPage

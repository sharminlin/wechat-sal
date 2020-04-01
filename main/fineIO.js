import { formateDate } from '../utils/util'
import { codeQuery } from '../utils/query'
import { createPageVisitLog } from '../api/common'

// 可能携带shareid的分享场景值---失效无用
// const shareScene = [
//   1001, 1007, 1008, 1011, 1012, 1013, 1025, 1032, 1036, 1047, 1048, 1049
// ]

/**
 * 记录OnShow页面时的访问日志信息
 */
let unLoading = null // 是否卸载中
export const recordPageVisitLog = function () {
  unLoading = null
  const app = getApp()
  const launchOpt = wx.getStorageSync('launchOpt') || {}
  const pages = getCurrentPages()
  const curPage = pages[pages.length - 1]
  const pageParams = codeQuery(curPage.options)
  const prePage = app.globalData.prePageInfo[app.globalData.prePageInfo.length - 1] || {}
  const prePageParams = codeQuery(prePage.options)

  curPage.ioRecordinfo = {
    comeTime: formateDate(new Date(), 'Y-M-D h:m:s'), // 进入时间
    openResource: launchOpt.scene || null, // 进入小程序时的场景值
    pageUrl: curPage.route, // 当前页路径
    pageParams: pageParams, // 当前页参数
    prePageUrl: prePage.route || 'start',
    prePageParams,
    messageId: curPage.options ? (curPage.options.messageId || null) : null,
    shareId: getShareId(curPage.route, curPage.options)
  }
  // console.log('----------------------', curPage.ioRecordinfo)
}

/**
 * 发送记录的访问日志信息
 */
export const sendPageVisitLog = function (context) {
  if (!unLoading) {
    unLoading = true
    // 当前页面隐藏，记录该页面信息
    const app = getApp()
    app.globalData.prePageInfo.push({
      route: context.route,
      options: context.options
    })
    // 每次保留3条
    app.globalData.prePageInfo = app.globalData.prePageInfo.slice(-3)
  
    // 推广的shareId
    const sessionShareId = checkNeedSessionShareId(context)
    if (sessionShareId && !context.ioRecordinfo.shareId) {
      context.ioRecordinfo.shareId = sessionShareId
    }
    const fwUserInfo = wx.getStorageSync('user') || {}
  
    // 发送记录
    createPageVisitLog({
      ...context.ioRecordinfo,
      outTime: formateDate(new Date(), 'Y-M-D h:m:s'),
      nickName: fwUserInfo.nickName || 'UNKNOW',
      shopId: context._shopId || null
    })
  }
}

// 记录shareId
export const recordSessionShareId = function (options) {
  // console.log(options)
  // 退出小程序 点击分享卡进入，场景值无变化，该判断不可用
  // if (shareScene.some(s => s === options.scene)) {
  // }
  setTimeout(() => {
    getApp().globalData.sessionShareId = getShareId(options.path, options.query)
    // console.log(getApp().globalData.sessionShareId)
  }, 100)
}

// 清除此次进入小程序携带的shareid
export const clearSessionShareId = function (options) {
  getApp().globalData.sessionShareId = null
}

function getShareId (route, options) {
  // 生成二维码页面，scene中携带有shareid的页面处理
  const hasShareRoutes = {
    'pages/customwine/detail/detail': function (scene) {
      const scenes = decodeURIComponent(scene).split('_')
      return scenes[1] ? parseInt(scenes[1]) : null
    },
    'pages/quotation/quotation': function (scene) {
      const scenes = decodeURIComponent(scene)
      return scenes ? parseInt(scenes) : null
    },
    'pages/wine/wine': function (scene) {
      const scenes = decodeURIComponent(scene).split('_')
      return scenes[1] ? parseInt(scenes[1]) : null
    }
  }

  if (options && options.shareid) {
    return options.shareid
  } else if (options && decodeURIComponent(options.scene) !== 'undefined' && hasShareRoutes[route]) {
    return hasShareRoutes[route](options.scene)
  } else {
    return null
  }
}

/**
 * 判断是否该页面为商家经营推广页，同时用户是分享进入，且店铺id为分享进入时记录的storeId
 * @param {*} context 
 */
function checkNeedSessionShareId (context) {
  // 推广 需要记录的商品 shareid 页面
  const sharePages = [
    'pages/goodsdetail/goodsdetail',
    'pages/goodsNice/detail/index',
    'pages/mine/shop/shop',
  ]
  const route = context.route
  const app = getApp()
  const { sessionShareId, sessionShopId } = app.globalData
  if (sessionShareId && sessionShopId && sessionShopId == context._shopId && sharePages.some(p => p === route)) {
    return sessionShareId
  } else {
    return null
  }
} 

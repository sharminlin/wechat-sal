// 通用点击跳转方法
export const handleNavigateTo = function (e) {
  const { url, type } = e.currentTarget.dataset
  const typeApiMap = {
    'navigate': wx.navigateTo,
    'switchTab': wx.switchTab,
    'redirect': wx.redirectTo,
    'reLaunch': wx.reLaunch,
    'navigateBack': wx.navigateBack
  }
  if (url) {
    typeApiMap[type] ? typeApiMap[type]({ url }) : wx.navigateTo({url})
  } else {
    console.error(new Error('url is not exited!'))
  }
}

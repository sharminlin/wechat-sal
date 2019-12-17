// 通用点击跳转方法
export const handleNavigateTo = function (e) {
  const { url } = e.currentTarget.dataset
  if (url) {
    wx.navigateTo({
      url,
      fail: function () {
        wx.switchTab({ url })
      }
    })
  }
}

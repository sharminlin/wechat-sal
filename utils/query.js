/**
 * @param {Object} options 参数对象
 */
export const codeQuery = function (options, connector = '&', splitSign = '=') {
  if (!options) return ''
  if (typeof options !== 'object') {
    console.error('options is not a object!')
    return ''
  }

  let args = ''
  for (let key in options) {
    const value = options[key]
    args += `${key}${splitSign}${value}${connector}`
  }

  return args.substring(0, args.length - 1)
}

/**
 * @param {String} options 参数字符串 
 */
export const decodeQuery = function (options, connector = '&', splitSign = '=') {
  if (!options) return
  if (typeof options !== 'string') {
    console.error('options is not a string!')
    return {}
  }

  const args = options.split(connector)
  const values = {}
  args.map(arg => {
    let [key, value] = arg.split(splitSign)
    values[key] = value
  })
  return values
}

/**
 * 获取query
 * @return {object} {path, queryString}
 */
export const getUrlAndQuery = function (url) {
  let path = ''
  let query = ''

  if (!url || typeof url !== 'string') return { path, query }
 
  const index = url.indexOf('?')
  if (index >= 0) {
    return {
      path: url.slice(0, index),
      query: url.slice(index + 1)
    }
  } else {
    return {
      path: url,
      query: ''
    }
  }
}

/**
 * 获取小程序当前路径+参数
 */
export const getPagePath = function () {
  let pages = getCurrentPages()
  let curPage = pages[pages.length - 1]
  // 参数
  const options = curPage.options
  let args = ''
  for (let key in options) {
    const value = options[key]
    args += `${key}=${value}&`
  }
  // 路径
  let pagePath = curPage.route
  ;
  (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath)
  // 加上参数
  pagePath = pagePath + '?' + args.substring(0, args.length - 1)
  return pagePath
}

export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export function formateDate (longtime, formate = 'Y-M-D') {
  let date = new Date(longtime)
  let timeMap = {
    'Y': date.getFullYear(),
    'M': formatNumber(date.getMonth() + 1),
    'D': formatNumber(date.getDate()),
    'h': formatNumber(date.getHours()),
    'm': formatNumber(date.getMinutes()),
    's': formatNumber(date.getSeconds())
  }
  let time = ''
  for (let i = 0; i < formate.length; i++) {
    if (timeMap[formate[i]]) {
      time = time + timeMap[formate[i]]
    } else {
      time = time + formate[i]
    }
  }
  return timeMap['Y'] ? time : ''
}
// list.js
const app = getApp()

Page({

  data: {
    pagedate: '',
    orders: []
  },
  
  onLoad: function (options) {
    this.setData({
      pagedate: options.date
    })
  },

  onShow: function () {
    this.getList()
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.getList()
  },

  getList: function () {
    wx.request({
      url: 'https://buaa.hiyouga.top/list.php',
      data: {
        type: 'selectByDate',
        date: this.data.pagedate
      },
      method: 'GET',
      dataType: 'json',
      success: res => {
        res.data.forEach(function (value, key, arr) {
          var end_date = new Date(Date.parse('2000-01-01 ' + value.start_at) + Date.parse('2000-01-01 ' + value.duration) - Date.parse('2000-01-01 00:00:00'))
          value.end_at = end_date.toTimeString().substring(0, 8)
          //console.log(value)
        })
        this.setData({
          orders: res.data
        })
        wx.setNavigationBarTitle({
          title: this.data.pagedate + '的时刻表'
        })
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
      }
    })
  },

  confirm: function (e) {
    var sid = e.currentTarget.dataset.idx
    wx.request({
      url: 'https://buaa.hiyouga.top/list.php',
      data: {
        type: 'selectBySid',
        sid: sid
      },
      method: 'GET',
      dataType: 'json',
      success: res => {
        var text = '您确认要预约' + res.data.name + '在' + res.data.date + ' ' + res.data.start_at + '于' + res.data.location + '开办的活动吗？'
        wx.showModal({
          title: '提示',
          content: text,
          success: status => {
            if (status.confirm) {
              this.order(sid)
            } else if (status.cancel) {
              //order canceled
            }
          }
        })
      }
    })
  },

  order: function (sid) {
    wx.request({
      url: 'https://buaa.hiyouga.top/order.php',
      data: {
        type: 'order',
        uid: app.globalData.userId,
        sid: sid,
        sign: app.makeSign(app.globalData.unique_key)
        //sign: app.makeSign(app.globalData.unique_key + String(Date.parse(new Date()) / 1000))
      },
      method: 'GET',
      dataType: 'json',
      success: res => {
        if (res.data.status == 'success') {
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 1650,
            mask: true,
            success: res => {
              setTimeout(function () {
                wx.reLaunch({
                  url: '../apply/apply'
                })
              }, 2000)
            }
          })
        } else if (res.data.status == 'denied') {
          wx.showToast({
            title: '页面过期，请刷新',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        } else {
          wx.showToast({
            title: '预约失败！_(:з」∠)_',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      }
    })
  }
})
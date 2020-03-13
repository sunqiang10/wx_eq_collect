// pages/users/userview.js
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    note: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getEqInfo()
  },
  getEqInfo: function () {
    var that = this;
    var serverUrl = app.serverUrl;
    var cooki = wx.getStorageSync("session_id")
    wx.request({
      url: serverUrl + '/report/ht_reports_by_open_id?open_id='+app.openid,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': wx.getStorageSync("session_id")
      },
      success: function (res) {
        let eqInfo = JSON.parse(res.data)
        wx.hideLoading();
        var jsonArr=[]
        if (res.data) {
          let eqInfo = JSON.parse(res.data)
          var list = eqInfo.info
          for (var i = 0; i < list.length; i++) {
            let eq = list[i].eq
            var imgUrl = "http://api.map.baidu.com/staticimage/v2?ak=D5UpuXR4eqRHFcBNrSQ18PWH9tGECceC&width=240&height=320&center="
              + eq.Lon + "," + eq.Lat + "&zoom=8&markers="
              + eq.Lon + "," + eq.Lat
              + "&markerStyles=m,,0xff0000&copyright=1"    
            let ris = []
            if (list[i].pic_path)       
              ris = list[i].pic_path.split(",")
            for(let index in ris){
              ris[index] = serverUrl + ris[index];
            }
            jsonArr.push({
              id: eq.cata_id,
              title: eq.Location_cname,
              videoDesc: eq.Lon + "" + eq.Lat,
              createTime: util.formatTime(new Date(eq.O_time)),
              m: eq.M,
              Lon: that.optLon(eq.Lon),
              Lat: that.optLat(eq.Lat),
              longitude: eq.Lon,
              latitude: eq.Lat,
              depth: eq.Depth,
              url: app.serverUrl + "/static/img/" + eq.cata_id + ".png",
              errImg: imgUrl,
              report: list[i],
              reportImgs:ris
            });
          }
          that.setData({
            note: jsonArr
          })
          console.log(that.data);
        } else {
          // 失败弹出框
          wx.showToast({
            title: '解析错误',
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },
  deleteReport:function(e){
    wx.showModal({
      title: '提示',
      content: '删除操作不可恢复，确认要删除么？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.serverUrl + '/report/delete_reports?id=' + e.currentTarget.dataset['index'],
            method: "POST",
            header: {
              'content-type': 'application/json', // 默认值
              'cookie': wx.getStorageSync("session_id")
            },
            success: function (res) {
              wx.redirectTo({
                url: '../users/userview'
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  returnMain(){
    wx.navigateBack({
      url: '../index/index'
    })
  }
  , logout(){
    wx.showModal({
      title: '提示',
      content: '确定要注销登陆吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.removeStorage({
            key: 'userInfo',
            success: function (res) {
              app.userInfo = {}
              app.isLogin=false
              wx.redirectTo({
                url: '../index/index'
              })
            },
          })          
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
  ,
  optLon(lon) {
    let lonStr = lon;
    if (lon < 0) {
      lonStr = "西经" + (0 - lon) + "度";
    } else {
      lonStr = "东经" + lon + "度";
    }
    return lonStr
  },
  optLat(lat) {
    let latStr = lat;
    if (lat < 0) {
      latStr = "南纬" + (0 - lat) + "度";
    } else {
      latStr = "北纬" + lat + "度";
    }
    return latStr
  },
  errorFunction(e) {
    var that = this;
    if (e.type == "error") {
      var errorImgIndex = e.currentTarget.dataset.index //获取错误图片循环的下标
      that.data.note[errorImgIndex].url = that.data.note[errorImgIndex].errImg
      // console.log(that.data.note[errorImgIndex].url) //错误图片替换为默认图片
      this.setData({
        note: that.data.note
      })
    }
  }
  ,
  //图片点击事件
  imgYu: function (e) {
    let indexs = e.currentTarget.dataset.index.split(',')
    let that = this;
    let imgList = this.data.note[indexs[0]].reportImgs;//获取data-list
    let src = this.data.note[indexs[0]].reportImgs[indexs[1]];//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
})
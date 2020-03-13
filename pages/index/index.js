//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()
var page_index= 1;
var page_size = 10;
var jsonArr = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgWidth: 0,
    imgHeight: 0,
    note: [],
    refresh4show:false
  },
  customInit:function(){
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //请求自己后台获取用户openid
        let session_id = wx.getStorageSync('session_id')
        let session_time = wx.getStorageSync('session_time')
        if (typeof (app.openid) == 'undefined'
          || app.openid.length <= 0 || session_id == '' || session_time == '') {
          wx.request({
            url: app.serverUrl + "/wx/wechat",
            data: {
              code: res.code
            },
            success: function (response) {
              if (response.data.ok == 1) {
                var openid = response.data.openid
                console.log('请求获取openid:' + openid);
                if (typeof (openid) != 'undefined') {
                  //可以把openid存到本地，方便以后调用
                  wx.setStorageSync('openid', openid);
                  app.openid = openid;
                  //获取session_id
                  wx.removeStorageSync('session_id')
                  wx.removeStorageSync('session_time')
                  if (response && response.header && response.header['Set-Cookie']) {
                    wx.setStorageSync('session_id', response.header['Set-Cookie']);//保存Cookie到Storage
                    wx.setStorageSync('session_time', new Date());//保存Cookie到Storage
                    // 调用后端
                    that.getEqInfo()
                  }
                }
                wx.hideLoading()
              } else {
                // 失败弹出框
                wx.showToast({
                  title: res.data,
                  icon: 'none',
                  duration: 3000
                })
                wx.hideLoading()
              }
            }
          })
        } else {
          wx.hideLoading()
          that.getEqInfo()
        }
      }
    })   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {  
    this.setData({
      refresh4show : !this.data.refresh4show
    })
  },
  getEqInfo:function(){
    var that = this;
    var serverUrl = app.serverUrl;
    var cooki = wx.getStorageSync("session_id")
    wx.request({
      url: serverUrl + '/wx/eq_infos?page_index=' + page_index + '&page_size=' + page_size,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': wx.getStorageSync("session_id")
      },
      success: function (res) {
        let eqInfo = JSON.parse(res.data)
        wx.hideLoading();
        if (res.data) {       
          let eqInfo = JSON.parse(res.data)
          var list = eqInfo.info
          for (var i = 0; i < list.length; i++) {
            var imgUrl = "http://api.map.baidu.com/staticimage/v2?ak=D5UpuXR4eqRHFcBNrSQ18PWH9tGECceC&width=240&height=320&center="
              + list[i].Lon + "," + list[i].Lat + "&zoom=8&markers="
              + list[i].Lon + "," + list[i].Lat
              + "&markerStyles=m,,0xff0000&copyright=1"
            jsonArr.push({
              id: list[i].cata_id,
              title: list[i].Location_cname,
              videoDesc: list[i].Lon + "" + list[i].Lat,
              createTime: util.formatTime(new Date(list[i].O_time)),
              m: list[i].M,
              Lon: that.optLon(list[i].Lon),
              Lat: that.optLat(list[i].Lat),
              longitude: list[i].Lon,
              latitude: list[i].Lat,
              depth: list[i].Depth,
              url: app.serverUrl + "/static/img/" + list[i].cata_id + ".png",
              errImg: imgUrl
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
  optLon(lon){
    let lonStr =lon;
    if (lon< 0) {
      lonStr = "西经" + (0 - lon) + "度";
    } else {
      lonStr = "东经" + lon + "度";
    }
    return lonStr
  },
  optLat(lat){
    let latStr = lat;
    if (lat < 0) {
      latStr = "南纬" + (0 - lat) + "度";
    } else {
      latStr = "北纬" + lat + "度";
    }
    return latStr
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    page_index++;
    this.getEqInfo()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    page_index++;
    this.getEqInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  errorFunction(e) {
    var that =this;
    if(e.type=="error"){
      var errorImgIndex = e.currentTarget.dataset.index //获取错误图片循环的下标
      that.data.note[errorImgIndex].url = that.data.note[errorImgIndex].errImg
      // console.log(that.data.note[errorImgIndex].url) //错误图片替换为默认图片
      this.setData({
        note: that.data.note
      })
    }
  },
  compCall:function(){
    this.customInit()
  }
})
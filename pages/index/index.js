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
    note: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    // 调用后端
    this.getEqInfo()
  },
  getEqInfo:function(){
    var that = this;
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/eq_infos?p=13811886617&page_index=' + page_index + '&page_size=' + page_size,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data) {         
          var list = res.data
          for (var i = 0; i < list.length; i++) {
            var imgUrl = "http://api.map.baidu.com/staticimage?width=240&height=320&center="
              + list[i].Lon + "," + list[i].Lat + "&zoom=8&markers="
              + list[i].Lon + "," + list[i].Lat
              + "&markerStyles=-1,-1,25,25&copyright=1"
            jsonArr.push({
              id: list[i].id,
              title: list[i].Location_cname,
              videoDesc: list[i].Lon + "" + list[i].Lat,
              createTime: util.formatGMTTime(new Date(list[i].O_time)),
              url: app.serverUrl + "/static/img/" + list[i].Cata_id + ".png",
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
      console.log(that.data.note[errorImgIndex].url) //错误图片替换为默认图片
      this.setData({
        note: that.data.note
      })
    }
  },
})
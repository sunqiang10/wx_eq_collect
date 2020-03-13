// pages/eqinfo/eqview.js
const app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: '4KPBZ-K54L3-KTI3X-YQAPJ-HL2J3-RGF2U' // 必填
});  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addmissage: '选的位置',
    stitle: '故宫',
    currenLat: "",
    currenLon: "",
    c_addr:'',
    scale: 6,
    show_p_bt:false,
    bt_width:'100%',
    isCanLocation:false,
    intensity_array:[1,2,3,4,5,6,7,8,9,10,11,12],
    intensity_index:0,
    house_type_array: ['钢混', '砖混', '砖木', '土木', '其他'],
    house_type_index:0,
    house_array: ['毁坏', '严重破坏', '中等破坏', '轻微破坏', '基本完好'],
    house_index: 0,
    is_wx_show :false,
    files: [],//{url: ''}, {loading: true}, {error: true}
    pic_array:[],
    old_pic_array:[],
    cata_id: "",
    markers: [],
    userInfo:{},
    reportList: [],
    submitBtDisable:false
  },
  customInit: function (){    
    let session_id = wx.getStorageSync('session_id')
    let session_time = wx.getStorageSync('session_time')
    if (typeof (app.openid) == 'undefined'
      || app.openid.length <= 0 || session_id == '' || session_time == '') {
      wx.redirectTo({
        url: '../index/index'
      })
    }
    var that = this
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.startLocation()
            },
            fail() {
              wx.showToast({
                title: '请授权当前位置，否则无法上报',
                icon: 'none',
                duration: 2000
              })
              that.setData({
                show_p_bt: true,
                bt_width: '50%'
              })
            }
          })
        } else {
          that.startLocation()
        }
      }
    })  
  },
  onLoad: function (options) {
    let session_id = wx.getStorageSync('session_id')
    let session_time = wx.getStorageSync('session_time')
    if (typeof (app.openid) == 'undefined'
      || app.openid.length <= 0 || session_id == '' || session_time == '') {
      wx.redirectTo({
        url: '../index/index'
      })
    }
    let that = this
    wx.request({
      url: app.serverUrl + '/wx/eq_reports?cata_id=' + options.id,
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': wx.getStorageSync("session_id")
      },
      success: function (res) {
        var jsonArr = [];
        if (res.data.ok == 1) {
          for (let index in res.data.info) {
            let eqInfo = res.data.info[index]
            jsonArr.push(
              {
                "id": eqInfo.cata_id,
                "sex": eqInfo.user.sex,
                "content": eqInfo.user.nickname + ":"
                  + " 伤亡人数:" + (parseInt(eqInfo.death_count) + parseInt(eqInfo.injured_count) + parseInt(eqInfo.wound_count)) + " 房屋损坏：" + eqInfo.house + " 位置："+  eqInfo.c_addr
                ,
                "zanNumber": 0
              }
            )
          }
          that.setData({
            reportList: jsonArr
          })
        }
      }
    })
    this.setData({
      cata_id: options.id,
      longitude: options.longitude,
      latitude: options.latitude,
      markers: [{
        latitude: options.latitude,
        longitude: options.longitude,
        width: 50,
        height: 50
      }],
      userInfo: app.userInfo
    })
  },
  setLocation: function (e) {  
    let that = this;
    if (!e.detail.authSetting['scope.userLocation']) {
      wx.showToast({
        title: '请授权当前位置，否则无法上报',
        icon: 'none',
        duration: 2000
      })
    } else {
      that.startLocation()
    }
  },
  startLocation: function () {
    let that = this;
    that.setData({
      show_p_bt: false,
      bt_width: '100%'
    })   
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        qqmapsdk.reverseGeocoder({
          location : {
            latitude: latitude,
            longitude: longitude
          },
          //get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
          success: function (res) {//成功后的回调
            var res = res.result;
            that.setData({
              currenLat: latitude,
              currenLon: longitude,
              c_addr: res.address,
              isCanLocation:true
            })
          },
          fail: function (error) {
            console.error(error);
          },
          complete: function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  submitReport: function (e) {
    let that = this
    if (!app.isLogin){
      wx.showToast({
        title: '请先点击上方按钮进行登录',
        icon: 'none',
        duration: 2000
      })
      return 
    }
    console.log(this.data.pic_array)
    console.log(this.data.old_pic_array)
    let eqReport = e.detail.value
    if (eqReport.c_addr.trim() ==''){
      wx.showToast({
        title: '调查点不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (eqReport.currenLat.trim() == '') {
      wx.showToast({
        title: '纬度不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (eqReport.currenLon.trim() == '') {
      wx.showToast({
        title: '经度不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (eqReport.death_count == '') {
      eqReport.death_count = 0;
    }
    if (eqReport.wound_count == '') {
      eqReport.wound_count = 0;
    }
    if (eqReport.injured_count == '') {
      eqReport.injured_count = 0;
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let intensity = this.data.intensity_array[this.data.intensity_index]
    let house_type = this.data.house_type_array[this.data.house_type_index]
    let house = this.data.house_array[this.data.house_index]
    let pic_path = ""
    let old_pic_path = ""
    for(var index in this.data.pic_array){
      pic_path = pic_path + "," + this.data.pic_array[index]
      old_pic_path = old_pic_path + "," + this.data.old_pic_array[index]
    }
    if(pic_path.length>0){
      pic_path = pic_path.substring(1)
      old_pic_path = old_pic_path.substring(1)
    }
    eqReport.intensity = intensity
    eqReport.house_type = house_type
    eqReport.house = house
    eqReport.pic_path = pic_path
    eqReport.cata_id = this.data.cata_id
    eqReport.is_wx = app.is_wx
    eqReport.open_id = app.openid
    eqReport.old_pic_path = old_pic_path
    if(!this.data.isCanLocation){
      wx.showToast({
        title: '请授权当前位置，否则无法上报',
        icon: 'none',
        duration: 2000
      })
      return
    }
    that.setData({
      submitBtDisable: true
    })
    wx.request({
      url: app.serverUrl + "/wx/add_report",
      method: "POST",
      data: {
        eqReport: eqReport
      }, 
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': wx.getStorageSync("session_id")
      },
      success: function (response) {
        if (response.data.ok == 1) {
          // 失败弹出框
          wx.showToast({
            title: response.data.info,
            icon: 'none',
            duration: 1000
          })
          wx.redirectTo({
            url: '../index/index'
          })
        } else {
          // 失败弹出框
          wx.showToast({
            title: response.data.info,
            icon: 'none',
            duration: 3000
          })
          wx.hideLoading()
        }
        that.setData({
          submitBtDisable: false
        })
      },error:function(e){
        that.setData({
          submitBtDisable: false
        })
      }
    })
  },
  uploadDelete: function (e) {
    let index = -1
    let oldA = this.data.old_pic_array
    let newA = this.data.pic_array
    for (var i = 0; i < oldA.length; i++) {
      if (e.detail.item.url.indexOf(oldA[i])>0){
        index =i;
        break;
      }
    }
    if (index>=0){
      oldA.splice(index, 1);
      newA.splice(index, 1);
      this.setData({
        old_pic_array: oldA,
        pic_array:newA
      })
    }
    console.log(this.data.pic_array)
    console.log(this.data.old_pic_array)
  },
  intensityPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      intensity_index: e.detail.value
    })
  },
  houseTypePickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      house_type_index: e.detail.value
    })
  },
  housePickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      house_index: e.detail.value
    })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },
  uplaodFile(files) {
    var that = this
    console.log('upload files', files)
    let urls = []
    let pic_array = this.data.pic_array
    let old_pic_array = this.data.old_pic_array
    // 文件上传的函数，返回一个promise  
    for (var index in files.tempFilePaths) {  
      urls.push(files.tempFilePaths[index])
      wx.uploadFile({
        url: app.serverUrl + '/report/update_img', //仅为示例，非真实的接口地址
        filePath: files.tempFilePaths[index],
        name: 'file',
        formData: {
          'user': 'test'
        },
        header: {
          'content-type': 'application/json', // 默认值
          'cookie': wx.getStorageSync("session_id")
        },
        success(res) {
          let data = JSON.parse(res.data)         
          pic_array.push(data.info)
          old_pic_array.push(data.old_filename)
          that.setData({
            pic_array: pic_array,
            old_pic_array: old_pic_array
          })
        }
      })
    };    
    return new Promise((resolve, reject) => {
      resolve({ urls })
    })
  },
  uploadError(e) {
    console.log('upload error', e.detail)
  },
  uploadSuccess(e) {
    console.log('upload success', e.detail)
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
  
  compCall: function () {
    this.setData({
      userInfo: app.userInfo
    })
    this.customInit()
  }
})
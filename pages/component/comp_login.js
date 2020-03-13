// utils/comp_login.js
const md5 = require('../../libs/md5.js');
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: { // 属性名
    fromUrl:{
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) {} // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字
    },
    refresh4show: {
      type: Boolean, 
      value: false, 
      observer: function (newVal, oldVal) {
        var that = this
        console.log('refresh4show')
        wx.getStorage({
          key: "userInfo",  // 和存储的key值一致；
          success: function (res) {
            let userInfo = res.data
            let session_id = userInfo.session_id
            let session_time = userInfo.session_time
            let username = userInfo.username
            let nickname = userInfo.nickname
            let sex = userInfo.sex
            let pic_path = userInfo.pic_path
            let is_wx = userInfo.is_wx
            let tel = userInfo.tel
            app.is_wx = is_wx
            app.userInfo = userInfo
            that.setData({
              nickname: nickname
            })
            if (app.isLogin == false) {
              that.setData({
                show_bt: true,
              })
            } else {
              that.setData({
                show_bt: false,
              })
              if (is_wx == 1) {
                that.setData({
                  show_user__bt1: true
                })
              }
              if (is_wx == 2) {
                that.setData({
                  show_user__bt2: true
                })
              }
              if (pic_path && pic_path != '') {
                that.setData({
                  pic_path: pic_path
                })
              }
            }
          }
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show_login: false,
    show_bt: false,
    show_user__bt1: false,
    show_user__bt2: false,
    username: '',
    password: '',
    nickname: '用户',
    pic_path: '../assets/user.png',
    toLoginBtDisable:false
  },
  /*组件生命周期*/
  lifetimes: {
    created() {
      console.log("在组件实例刚刚被创建时执行")
    },
    attached() {
      console.log("在组件实例进入页面节点树时执行")
    },
    ready() {
      console.log("在组件在视图层布局完成后执行")
      this.customInit()
    },
    moved() {
      console.log("在组件实例被移动到节点树另一个位置时执行")
    },
    detached() {
      console.log("在组件实例被从页面节点树移除时执行")
    },
    error() {
      console.log("每当组件方法抛出错误时执行")
    },
    /*组件所在页面的生命周期 */
    pageLifetimes: {
      show: function () {
        // 页面被展示
        console.log("页面被展示")
      },
      hide: function () {
        // 页面被隐藏
        console.log("页面被隐藏")
      },
      resize: function (size) {
        // 页面尺寸变化
        console.log("页面尺寸变化")
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    customInit: function() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
      wx.getStorage({
        key: "userInfo",  // 和存储的key值一致；
        success: function (res) {
          let userInfo = res.data
          let session_id = userInfo.session_id
          let session_time = userInfo.session_time
          let username = userInfo.username
          let nickname = userInfo.nickname
          let sex = userInfo.sex
          let pic_path = userInfo.pic_path
          let is_wx = userInfo.is_wx
          let tel = userInfo.tel
          app.is_wx = is_wx
          app.userInfo = userInfo
          that.setData({
            nickname: nickname
          })
          console.log(username + "," + nickname + "," + sex + "," + pic_path + "," + is_wx + "," + tel)
          if (is_wx == '') {
            app.isLogin = false
          } else if (is_wx == 1) {
            if ((!nickname && !sex && !pic_path)
              || (nickname == '' && sex == '' && pic_path == '')) {
              app.isLogin = false
            } else {
              app.isLogin = true
            }
          } else if (is_wx == 2) {
            if ((!nickname && !tel) || (nickname == '' && tel == '')) {
              app.isLogin = false
            } else {
              app.isLogin = true
            }
          }
          if (app.isLogin == false) {
            that.setData({
              show_bt: true,
            })
          } else {
            that.setData({
              show_bt: false,
            })
            if (is_wx == 1) {
              that.setData({
                show_user__bt1: true
              })
            }
            if (is_wx == 2) {
              that.setData({
                show_user__bt2: true
              })
            }
            if (pic_path && pic_path != '') {
              that.setData({
                pic_path: pic_path
              })
            }
          }
          wx.hideLoading()
          that.callMain();
        }, fail: function (res) {
          wx.hideLoading()
          that.callMain();
          app.isLogin = false
          that.setData({
            show_bt: true,
          })
        }
      })
    },
    showLoginView() {
      this.setData({
        show_login: true,
        show_bt: false
      });
      this.start_ani();
    },
    hideLoginView() {
      this.end_ani();
      this.setData({
        show_bt: true,
        show_login: false
      });
    },
    getUsername: function (e) {
      this.setData({
        username: e.detail.value
      });
    },
    getPassword: function (e) {
      this.setData({
        password: e.detail.value
      });
    },
    start_ani: function () {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        delay: 1
      });
      animation.opacity(0.9).translate(0, 140).step()
      this.setData({
        ani: animation.export()
      })
    },
    end_ani: function () {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        delay: 1
      });
      animation.opacity(0).translate(0, -140).step()
      this.setData({
        ani: animation.export()
      })
    },
    onGotUserInfo: function (e) {
      console.log(e.detail.errMsg)
      console.log(e.detail.userInfo)
      console.log(e.detail.rawData)
      this.toLoginWx(this, e.detail.userInfo)
    },
    toLogin() {
      let that = this
      let username =  this.data.username
      let password = md5.hexMD5(this.data.password)
      if (!app.openid || app.openid == '' || app.openid.length <= 0) {
        wx.redirectTo({
          url: '../index/index'
        })
        return
      }
      this.setData({
        toLoginBtDisable : true
      })
      wx.request({
        url: app.serverUrl + '/wx/wx_login',
        data: {
          username: username,
          password: password,
          open_id: app.openid
        },
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'cookie': wx.getStorageSync("session_id")
        },
        success: function (res) {
          if (res.data.ok == 1) {
            let userInfo = {
              username: res.data.username,
              nickname: res.data.nickname,
              sex: res.data.sex,
              pic_path: res.data.pic_path,
              is_wx: res.data.is_wx,
              tel: res.data.tel,
              p_user: res.data.p_user,
            }
            wx.setStorage({
              key: 'userInfo',
              data: userInfo
              , success: function (res) {
                wx.showToast({
                  title: '登陆成功',
                  icon: 'SUCCESS',
                  duration: 2000
                })
                that.setData({
                  show_login: false,
                  show_bt: false
                });
                wx.redirectTo({
                  url: that.data.fromUrl
                })
              }
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'ERROR',
              duration: 2000
            })
          }
          that.setData({
            toLoginBtDisable: false
          })
        }, error: function (res){
          that.setData({
            toLoginBtDisable: false
          })
        }
      });
    },
    toLoginWx(that, userInfo) {
      if (!app.openid || app.openid == '' || app.openid.length <= 0) {
        wx.redirectTo({
          url: '../index/index'
        })
        return
      }
      wx.request({
        url: app.serverUrl + '/wx/login4wx',
        data: {
          nickname: userInfo.nickName,
          pic_path: userInfo.avatarUrl,
          sex: userInfo.gender,
          city: userInfo.city,
          province: userInfo.province,
          open_id: app.openid
        },
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'cookie': wx.getStorageSync("session_id")
        },
        success: function (res) {
          if (res.data.ok == 1) {
            let userInfo = {
              username: res.data.username,
              nickname: res.data.nickname,
              sex: res.data.sex,
              pic_path: res.data.pic_path,
              is_wx: res.data.is_wx,
              tel: res.data.tel,
              p_user: res.data.p_user,
            }
            wx.setStorage({
              key: 'userInfo',
              data: userInfo
              , success: function (res) {
                wx.showToast({
                  title: '登陆成功',
                  icon: 'SUCCESS',
                  duration: 2000
                })
                that.setData({
                  show_login: false,
                  show_bt: false
                });
                wx.redirectTo({//../index/index
                  url: that.data.fromUrl
                })
              }, fail: function (res) {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'ERROR',
                  duration: 2000
                })
              }
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'ERROR',
              duration: 2000
            })
          }
        }
      });
    },
    callMain() {
      var myEventDetail = {msg: '登录刷新',}
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  }
})

// pages/component/bullet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    reportList: {
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { 
        this.setData({
          baseData: newVal
        })
        this.setDM()
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字 
    }
  },
  ready: function ready(){
    let that = this;
  },
  /**
   * 组件的初始数据
   */
  data: {
    iconGood: '../../assets/icon-good.png',
    avatarBoy: '../../assets/icon_avatar_boy.png',
    avatarGirl: '../../assets/icon_avatar_girl.png',
    iconBoy: '../../assets/icon-boy.png',
    iconGirl: '../../assets/icon-girl.png',
    banner: '',
    baseData:[],
    dmData: [],
    symbolLeft: '{{',
    symbolRight: '}}',
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 处理弹幕位置
    setDM: function () {
      // 处理弹幕参数
      const dmArr = [];
      const _b = this.data.baseData;
      for (let i = 0; i < _b.length; i++) {
        const _p = {
          id: _b[i].id,
          sex: _b[i].sex,
          content: _b[i].content,
          zanNumber: _b[i].zanNumber
        };
        dmArr.push(_p);
      }
      this.setData({
        dmData: dmArr
      });
    }
  }
})

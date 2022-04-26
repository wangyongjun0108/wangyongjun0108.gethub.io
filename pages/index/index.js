// pages/text/text.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataBuff: "",
    x: [],
    y: [],
    color: [],
    targetNumber: 0,
    isHidden:[],
    allHidden:false,
    timer:0,
    leftLight:"green",
    rightLight:"green",
  },

  main: function () {
    let that = this;
    let dataBuff = getApp().globalData.arrayBuffer;
    // let dataBuff = "525447547000a915000050000a00000524fe3114ecff38ff010588fee712ecff70fe0205ecfe9e11ecffa8fd030550ff5410ecffe0fc0405b4ff0a0fecff18fc05051700bf0decff50fb06057b00750cecff88fa0705df002c0becffc0f908054301e209ecfff8f80905a7019808ecff30f845454e44";
    // console.log(dataBuff);
    let N = that.getTargetNumber(dataBuff);
    let x = that.getTargetX(dataBuff, N);
    let y = that.getTargetY(dataBuff, N);
    let xDisplay = 0; //显示区域的范围
    let yDisplay = 650;
    // let xWarning = 100;
    // let yWarning = 400 + 50;
    let xWarning = getApp().globalData.xWarning * 20-10;
    let yWarning = getApp().globalData.yWarning *20 + 50;
    let countX = 0;
    let countY = 0;
    let tempX = [];
    let tempY = [];
    let tempColor = [];
    // let displayN = 0;
    let tempcount = 0; //
    let isHidden = [];
    let countHidde = 0;
    let leftLight = "green";
    let rightLight = "green";
    if (this.isFrame(dataBuff, N)) {
      // console.log("----------------");
      for (let i = 0; i < N; i++) {
        // console.log("----------------");
        if (x[i] > xDisplay && x[i] < xDisplay + 380 && y[i] < yDisplay) {
          // console.log("----------------");
          tempX[countX++] = x[i] - 10;
          tempY[countY++] = y[i] * 2 + 40;
          // displayN++;
          isHidden[countHidde++] = "true";
          if (x[i] - 10 > xWarning && x[i] - 10 < xWarning + 200 && y[i] * 2 + 40 < yWarning) {
            tempColor[tempcount++] = "red";
            if(x[i] < 200){
              leftLight = "red";
            }
            else{
              rightLight = "red";
            };
          } 
          else {
            tempColor[tempcount++] = "green";
          }
        }
        else{
          isHidde[countHidde++] = "false";
        };
      };
      // console.log(leftLight,rightLight);
      // console.log(x,y);
      // console.log(tempX,tempY);
      that.setData({
        x: tempX,
        y: tempY,
        targetNumber: N,
        color: tempColor,
        leftLight:leftLight,
        rightLight:rightLight,
      });
    } else {
      that.setData({
        x: [],
        y: [],
      });
    };
  },



  /** 
   * 判断帧头帧尾和数据的格式是否正确
   */
  isFrame: function (data, n) {
    let that = this;
    if (that.isFrameHeader(data) && that.isFrameRear(data, n)) {
      if (n == (that.getDataBuffLength(data) - 18) / 10) {
        return true;
      } else {
        return false;
      };
    } else {
      return false;
    };
  },


  /** 
   * 解析数据时，数据比对时不对就丢弃，并清完全局变量dataBuff
   */
  clearDataBuffer: function () {
    // getApp().globalData.dataBuffer = "";
    let that = this;
    that.setData({
      dataBuff: "",
    });
    // getApp().globalData.dataBuff = "";
  },

  /** 
   * 小端转大端，输入字符串十六进制数，返回十进制数
   */

  smallToBig: function (data) {
    let length = data.length;
    let tempData = "";
    for (let i = length - 1; i >= 0; i = i - 2) {
      tempData += data[i - 1] + data[i];
    };
    return tempData;
  },

  /** 
   * 有符号16进制转10进制
   * 
   */

  intToUint: function (data) {
    // let data = "ffff";
    // JS中进制的转换都是以十进制为中介的
    // parseInt是把16进制转为10进制数值，
    // toString是将10进制数值转为2进制的字符串
    let two = parseInt(data, 16).toString(2);
    let bitNum = data.length * 4;
    if (two.length < bitNum) {
      while (two.length < bitNum) {
        two = "0" + two;
      }
    }
    if (two.substring(0, 1) == "0") {
      two = parseInt(two, 2);
      return two;
    } else {
      let two_unsign = "";
      two = parseInt(two, 2) - 1;
      two = two.toString(2);
      two_unsign = two.substring(1, bitNum);
      two_unsign = two_unsign.replace(/0/g, "z");
      two_unsign = two_unsign.replace(/1/g, "0");
      two_unsign = two_unsign.replace(/z/g, "1");
      two = parseInt(-two_unsign, 2);
      return two;
    }
  },

  /** 
   * 整个databuff的长度
   */
  getDataBuffLength: function (data) {
    return data.length / 2;
  },


  /** 
   * 判断帧头
   */
  isFrameHeader: function (data) {
    let that = this;
    let frameHeader = data.substring(0, 8);
    // console.log(frameHeader);
    if (frameHeader == "52544754") {
      // console.log("true")
      return true;
    } else {
      // console.log("false");
      // that.clearDataBuffer();
      // console.log(getApp().globalData.dataBuffer);
      return false;
    }
  },

  /** 
   * 获取帧长度
   */
  getFrameLength: function (data) {
    let that = this;
    let frameLengthData = data.substring(8, 12);
    return parseInt(that.smallToBig(frameLengthData), 16);
  },

  /**
   * 获取帧序号
   */
  getFrameSerialNumber: function (data) {
    let that = this;
    let FrameSerialNumber = data.substring(12, 20);
    return parseInt(that.smallToBig(FrameSerialNumber), 16);
  },

  /** 
   * 获取帧周期
   */
  getFramePeriod: function (data) {
    let that = this;
    let framePeriod = data.substring(20, 24);
    return parseInt(that.smallToBig(framePeriod), 16);
  },

  /** 
   * 获取目标个数
   */
  getTargetNumber: function (data) {
    let that = this;
    let targetNumber = data.substring(24, 26);
    return parseInt(targetNumber, 16);
  },

  /** 
   * 获取自车车速
   */
  getspeed: function (data) {
    let that = this;
    let speed = data.substring(26, 28);
    return parseInt(speed, 16) * 0.5;
  },

  /** 
   * 获取目标ID
   */
  getTargetID: function (data, N) {
    let that = this;
    let targetID = [];
    for (let i = 0; i < N; i++) {
      targetID = targetID.concat(parseInt(data.substring(28 + i * 10 * 2, 30 + i * 10 * 2), 16));
    };
    return targetID;
  },


  /** 
   * 获取横向位置X
   */
  getTargetX: function (data, N) {
    let that = this;
    let targetX = [];
    for (let i = 0; i < N; i++) {
      let x = that.smallToBig(data.substring(32 + i * 10 * 2, 36 + i * 10 * 2));
      targetX = targetX.concat(((parseInt((that.intToUint(x) * 0.01))) + 20) * 10 - 10);
      // targetX = targetX.concat(parseInt(that.intToUint(x)*0.01));
    };
    return targetX;
  },

  /** 
   * 获取纵向位置Y
   */
  getTargetY: function (data, N) {
    let that = this;
    let targetY = [];
    for (let i = 0; i < N; i++) {
      let y = that.smallToBig(data.substring(36 + i * 10 * 2, 40 + i * 10 * 2));
      targetY = targetY.concat((parseInt(that.intToUint(y) * 0.01 - 5)) * 10 - 10);
      // targetY = targetY.concat(parseInt(that.intToUint(y)*0.01-5));
    };
    return targetY;
  },

  /** 
   * 获取帧尾
   */
  isFrameRear: function (data, N) {
    let that = this;
    let targetNumber = data.substring(N * 10 * 2 + 28, N * 10 * 2 + 36);
    if (targetNumber == "45454e44") {
      return true;
    } else {
      // console.log("false");
      that.clearDataBuffer();
      return false;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    console.log(getApp().globalData.xWarning,getApp().globalData.yWarning)
    let that = this;
    // that.main();
    let dataBuff = getApp().globalData.arrayBuffer;    
    that.data.timer = setInterval(
      function(){
        let data1 = that.getFrameSerialNumber(dataBuff);
        that.main();
        let data2 = that.getFrameSerialNumber(dataBuff);
        if(data1 == data2){
          that.setData({
            allHidden:true,
          });
        }
        else{
          that.setData({
            allHidden:false,
          });
        };
      },
      100,
    );
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this;
    clearInterval(that.data.timer);
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

  }
})
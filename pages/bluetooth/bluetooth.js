// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}


// pages/bluetooth1/blluetooth1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**用过过滤掉搜索的蓝牙设备 */
    servicesID: ["FFE0"],
    devices: "",
    connectedDeviceId: "",
    devicesId: "",
    services: "",
    servicesUUID: "",
    writeServicweId: "",
    readServiceweId: "",
    writeCharacteristicsId: "",
    readCharacteristicsId: "",
    arrayBuffer: "",
    MTU: 200,
  },

  InitBluetooth: function () {
    let that = this;
    that.openBluetoothAdapter();
  },
  
  // SearchBluetooth: function () {
  //   let that = this;
  //   that.createBLEConnection();
  // },

  closeBuletooth:function(){
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("11111");
        wx.showToast({
          title: '蓝牙已关闭',
          duration: 2000,
        })
      },
    })
  },



  /** 
   * 初始化蓝牙模块
   * adapter:搜索
   */

  openBluetoothAdapter() {
    let that = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        wx.showLoading({
          title: '搜索中',
        })
        // console.log(res);
        that.getBluetoothAdapterState();
      },
      fail: function (res) {
        //弹窗
        wx.showToast({
          title: '请打开蓝牙',
          duration: 2000,
        });
      },
    });
  },

  /** 
   * 获取蓝牙适配器状态
   */
  getBluetoothAdapterState: function () {
    let that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        // console.log(res);
        that.startBluetoothDevicesDiscovery();
      },
      fail: function (res) {
        //弹窗
        wx.showToast({
          title: '蓝牙状态不可用',
          duration: 2000,
        });
      },
    });
  },

  /** 
   * 搜索蓝牙设备
   */
  startBluetoothDevicesDiscovery: function () {
    let that = this;
    wx.startBluetoothDevicesDiscovery({
      //services属性用于过滤掉其他蓝牙设备，只保留这个uuid的设备
      services: that.data.servicesID,
      success: (res) => {
        // console.log(res);
        that.getBluetoothDevices();
      },
    });
  },

  /** 
   * 获取所有的蓝牙设备
   */
  getBluetoothDevices: function () {
    let that = this;
    wx.getBluetoothDevices({
      success: (res) => {
          // if (res.devices.length == 0) {
          //   wx.showToast({
          //     title: '未找到蓝牙设备',
          //     duration: 2500,
          //   });
          //   return;
          // };
          setTimeout(()=>{
            wx.hideLoading();
          },2000);
        // console.log(res);
        for (let i = 0; i < res.devices.length; i++) {
          if (res.devices[i].connectable == true) {
            that.setData({
              devices: res.devices,
              // devicesId: res.devices[i].deviceId,
            });
          };
        };
      },
      fail: function (res) {
        wx.showToast({
          title: '未找到蓝牙设备',
          duration: 2500,
        });
      },
    });
  },


  /** 
   * 连接已发现的蓝牙设备
   */
  bluetoothConnect: function (event) {
    let that = this;
    // console.log(event);
    wx.createBLEConnection({
      deviceId: event.currentTarget.id,
      success: function (res) {
        // console.log(res);
        that.setData({
          connectedDeviceId: event.currentTarget.id,
        });
        // 这是安卓的可以设置MTU实现收发大于20字节的，ISO不支持
        wx.setBLEMTU({
          deviceId: that.data.connectedDeviceId,
          mtu: that.data.MTU,
          success: function (res) {
            // console.log(res);
          },
        });
        wx.showLoading({
          title: '正在连接设备',
        })
        that.stopBluetoothDevicesDiscovery();
        that.getBLEDeviceservices();
        // that.getBLEDeviceCharacteristics();
      },
      fail: function (res) {
        wx.showToast({
          title: '连接失败',
        })
        // console.log("连接失败");
      },
    });
  },

  test: function () {
    let that = this;
  },


  /** 
   * 如果找到了所需要的蓝牙设备，停止搜索
   */
  stopBluetoothDevicesDiscovery: function () {
    let that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        // console.log("已连接设备，搜索蓝牙设备停止");
      },
    });
  },

  /** 
   * 获取蓝牙的服务
   */
  getBLEDeviceservices: function () {
    let that = this;
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        // console.log(res);
        // console.log(res.services);
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].uuid == "0000FFE0-0000-1000-8000-00805F9B34FB") {
            // console.log(res);
            that.setData({
              services: res.services,
              servicesUUID: res.services[i].uuid,
            });
          };
        };
        that.getBLEDeviceCharacteristics();
      },
      fail: function (res) {
        // console.log("获取蓝牙服务失败");
      },
    });
  },

  /** 
   * 获取所有特征值
   */
  getBLEDeviceCharacteristics: function () {
    let that = this;
    wx.getBLEDeviceCharacteristics({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.servicesUUID,
      success: function (res) {
        // console.log(res);
        for (let i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].uuid == "0000FFE1-0000-1000-8000-00805F9B34FB") {
            that.setData({
              writeCharacteristicsId: res.characteristics[i].uuid,
              writeServicweId: that.data.servicesUUID,
            });
          };
        };
        for (let i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].uuid == "0000FFE1-0000-1000-8000-00805F9B34FB") {
            that.setData({
              readCharacteristicsId: res.characteristics[i].uuid,
              readServicweId: that.data.servicesUUID,
            });
          };
        };
        that.notifyBLECharacteristicValueChange();
        wx.hideLoading({
        })
      },
      fail: function (res) {
        // console.log("fail:", res);
      },
    });
  },

  /** 
   * 启用特征值变量
   */
  notifyBLECharacteristicValueChange: function () {
    let that = this;
    let notifyServicweId = that.data.readServicweId;
    let notifyCharacteristicsId = that.data.readCharacteristicsId;
    wx.notifyBLECharacteristicValueChange({
      characteristicId: notifyCharacteristicsId,
      deviceId: that.data.connectedDeviceId,
      serviceId: notifyServicweId,
      state: true,
      success: function (res) {
        // console.log("-------------------------");
        // console.log(res);
        wx.showToast({
          title: '连接成功！',
        })
        that.reseiveBluetoothData();
      },
      fail: function (res) {
        // console.log(res);
      },
    });
  },

  /** 
   * 接收蓝牙返回的信息
   */
  reseiveBluetoothData: function () {
    let that = this;
    wx.onBLECharacteristicValueChange((res) => {
      // console.log(res);
      // that.setData({
      //   arrayBuffer: ab2hex(res.value),
      // });
      // console.log(that.data.arrayBuffer);
      getApp().globalData.arrayBuffer = ab2hex(res.value);
      // console.log("----------------------------------");
      that.setData({
        arrayBuffer:getApp().globalData.arrayBuffer,
      });
      // console.log(that.data.arrayBuffer)
      // console.log()
    })
    // console.log(getApp().globalData.arrayBuffer);
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

  }
})
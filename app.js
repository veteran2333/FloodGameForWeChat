// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
  },
  globalData: {
    gameState: {
      board: [],
      size: 10,
      colors: 6,
      hasObstacles: false,
      hasSpecialCells: false,
      infiniteMoves: false,
      moves: 0,
      maxMoves: 25,
      floodedCells: new Set(),
      colorPalette: [
        '#FF5252', '#4CAF50', '#2196F3', 
        '#FFEB3B', '#9C27B0', '#FF9800', 
        '#00BCD4', '#795548'
      ]
    }
  }
})

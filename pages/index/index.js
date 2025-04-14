// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    moves: 0,
    maxMoves: 25,
    gridSize: 10,
    gridSizeOptions: [6, 8, 10, 12],
    colorCount: 6,
    board: [],
    floodedCells: new Set(),
    colorPalette: [
      '#FF5252', // 红色
      '#4CAF50', // 绿色
      '#2196F3', // 蓝色
      '#FFEB3B', // 黄色
      '#9C27B0', // 紫色
      '#FF9800', // 橙色
      '#00BCD4', // 青色
      '#795548'  // 棕色
    ],
    showRulesModal: false,
    showGameOverModal: false,
    isWin: false,
    isShaking: false
  },

  onLoad() {
    this.initGame()
  },

  initGame() {
    const board = this.generateBoard()
    this.setData({
      board,
      moves: 0,
      showGameOverModal: false,
      isWin: false
    })
  },

  generateBoard() {
    const board = []
    for (let i = 0; i < this.data.gridSize; i++) {
      const row = []
      for (let j = 0; j < this.data.gridSize; j++) {
        const colorIndex = Math.floor(Math.random() * this.data.colorCount)
        const isObstacle = Math.random() < 0.1 && !(i === 0 && j === 0)
        row.push({
          // 如果是障碍物，颜色设置为灰色，否则使用随机颜色
          color: isObstacle ? '#666666' : this.data.colorPalette[colorIndex],
          isObstacle: isObstacle
        })
      }
      board.push(row)
    }

    // 确保左上角(0,0)、右侧(0,1)和下方(1,0)的格子颜色各不相同
    if (board[0][1] && board[1][0]) { // 确保这些格子存在
      const topLeftColor = board[0][0].color

      // 如果右侧格子颜色与左上角相同，则更改其颜色
      if (board[0][1].color === topLeftColor && !board[0][1].isObstacle) {
        let newColorIndex
        do {
          newColorIndex = Math.floor(Math.random() * this.data.colorCount)
        } while (this.data.colorPalette[newColorIndex] === topLeftColor)
        board[0][1].color = this.data.colorPalette[newColorIndex]
      }

      // 如果下方格子颜色与左上角或右侧格子相同，则更改其颜色
      if (!board[1][0].isObstacle) {
        let newColorIndex
        do {
          newColorIndex = Math.floor(Math.random() * this.data.colorCount)
        } while (
          this.data.colorPalette[newColorIndex] === topLeftColor ||
          this.data.colorPalette[newColorIndex] === board[0][1].color
        )
        board[1][0].color = this.data.colorPalette[newColorIndex]
      }
    }

    // 初始化洪水区域
    const floodedCells = new Set(['0,0'])
    this.setData({ floodedCells })
    return board
  },

  onGridSizeChange(e) {
    const index = parseInt(e.detail.value)
    const newSize = this.data.gridSizeOptions[index]
    this.setData({
      gridSize: newSize,
      // 确保最大步数保持不变
      maxMoves: 25
    }, () => {
      this.initGame()
    })
  },

  onColorCountChange(e) {
    const colorCounts = [3, 4, 5, 6, 7, 8]
    const newColorCount = colorCounts[parseInt(e.detail.value)]
    this.setData({
      colorCount: newColorCount,
      // 确保最大步数保持不变
      maxMoves: 25
    }, () => {
      this.initGame()
    })
  },

  // 检查格子是否与洪水区域相邻
  isAdjacentToFlood(row, col) {
    console.log(`检查格子(${row}, ${col})是否与洪水区域相邻`)

    // 如果格子是障碍物，返回false
    if (this.data.board[row][col].isObstacle) {
      console.log(`格子(${row}, ${col})是障碍物，返回false`)
      return false
    }

    // 如果格子本身已经在洪水区域内，返回false（禁止点击洪水内部的格子）
    if (this.data.floodedCells.has(`${row},${col}`)) {
      console.log(`格子(${row}, ${col})已在洪水区域内，返回false`)
      return false
    }

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dx, dy] of directions) {
      const newRow = row + dx
      const newCol = col + dy
      // 检查相邻格子是否在边界内且在洪水区域内
      console.log(`检查相邻格子(${newRow}, ${newCol})`)

      if (newRow >= 0 && newRow < this.data.gridSize &&
          newCol >= 0 && newCol < this.data.gridSize) {
        console.log(`相邻格子(${newRow}, ${newCol})在边界内`)

        if (this.data.floodedCells.has(`${newRow},${newCol}`)) {
          console.log(`相邻格子(${newRow}, ${newCol})在洪水区域内，返回true`)
          return true;
        }
      }
    }
    console.log(`格子(${row}, ${col})不与洪水区域相邻，返回false`)
    return false
  },

  // 洪水填充算法 - 非递归实现，避免栈溢出
  floodFill(row, col, oldColor, newColor) {
    console.log(`执行洪水填充: 起始点(${row}, ${col}), 原颜色=${oldColor}, 新颜色=${newColor}`)

    // 如果起始点不符合条件，直接返回
    if (row < 0 || row >= this.data.gridSize ||
        col < 0 || col >= this.data.gridSize) {
      console.error(`起始点(${row}, ${col})超出边界，返回`)
      return
    }

    if (this.data.board[row][col].isObstacle) {
      console.error(`起始点(${row}, ${col})是障碍物，返回`)
      return
    }

    // 使用队列实现广度优先搜索
    const queue = [[row, col]]
    const newBoard = [...this.data.board]
    const newFloodedCells = new Set(this.data.floodedCells)
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    console.log(`当前洪水区域: ${Array.from(newFloodedCells).join(', ')}`)

    while (queue.length > 0) {
      const [currentRow, currentCol] = queue.shift()
      console.log(`处理格子(${currentRow}, ${currentCol})`)

      // 如果当前格子已经被处理过或不符合条件，跳过
      if (currentRow < 0 || currentRow >= this.data.gridSize ||
          currentCol < 0 || currentCol >= this.data.gridSize) {
        console.log(`格子(${currentRow}, ${currentCol})超出边界，跳过`)
        continue
      }

      if (newBoard[currentRow][currentCol].isObstacle) {
        console.log(`格子(${currentRow}, ${currentCol})是障碍物，跳过`)
        continue
      }

      if (newFloodedCells.has(`${currentRow},${currentCol}`)) {
        console.log(`格子(${currentRow}, ${currentCol})已在洪水区域内，跳过`)
        continue
      }

      // 只处理与目标颜色相同的格子
      const cellColor = newBoard[currentRow][currentCol].color
      console.log(`格子(${currentRow}, ${currentCol})颜色=${cellColor}, 目标颜色=${oldColor}`)

      if (cellColor === oldColor) {
        // 更新格子颜色并标记为已淹没
        console.log(`将格子(${currentRow}, ${currentCol})颜色从${cellColor}改为${newColor}`)
        newBoard[currentRow][currentCol].color = newColor
        newFloodedCells.add(`${currentRow},${currentCol}`)

        // 将相邻格子加入队列
        for (const [dx, dy] of directions) {
          const nextRow = currentRow + dx
          const nextCol = currentCol + dy
          console.log(`将相邻格子(${nextRow}, ${nextCol})加入队列`)
          queue.push([nextRow, nextCol])
        }
      } else {
        console.log(`格子(${currentRow}, ${currentCol})颜色与目标颜色不同，跳过`)
      }
    }

    console.log(`洪水填充完成，新洪水区域: ${Array.from(newFloodedCells).join(', ')}`)

    // 更新状态
    try {
      this.setData({
        board: newBoard,
        floodedCells: newFloodedCells
      })
      console.log(`状态更新成功，洪水区域大小: ${newFloodedCells.size}`)
    } catch (error) {
      console.error(`状态更新失败: ${error.message}`)
    }
  },

  handleCellClick(e) {
    const { row, col } = e.currentTarget.dataset
    if (this.data.moves >= this.data.maxMoves) {
      this.gameOver(false)
      return
    }

    // 打印调试信息，查看点击的坐标和棋盘状态
    console.log(`点击坐标: (${row}, ${col})`)
    console.log(`棋盘大小: ${this.data.gridSize}x${this.data.gridSize}`)

    // 检查坐标是否有效
    if (row < 0 || row >= this.data.gridSize || col < 0 || col >= this.data.gridSize) {
      console.error(`无效坐标: (${row}, ${col})`)
      this.setData({ isShaking: true })
      setTimeout(() => {
        this.setData({ isShaking: false })
      }, 500)
      return
    }

    // 获取点击的格子
    const cell = this.data.board[row][col]
    console.log(`点击格子颜色: ${cell.color}, 是否障碍物: ${cell.isObstacle}`)
    console.log(`洪水区域: ${Array.from(this.data.floodedCells).join(', ')}`)

    // 检查是否是有效的点击：不是障碍物且与洪水区域相邻
    if (cell.isObstacle || !this.isAdjacentToFlood(row, col)) {
      // 添加抖动动画提示无效点击
      console.log(`无效点击: 障碍物=${cell.isObstacle}, 相邻=${this.isAdjacentToFlood(row, col)}`)
      this.setData({ isShaking: true })
      setTimeout(() => {
        this.setData({ isShaking: false })
      }, 500)
      return
    }

    // 获取当前洪水颜色
    let currentColor = null
    for (const coords of this.data.floodedCells) {
      const [r, c] = coords.split(',').map(Number)
      currentColor = this.data.board[r][c].color
      break
    }
    console.log(`当前洪水颜色: ${currentColor}, 点击格子颜色: ${cell.color}`)

    // 如果点击的格子颜色与当前洪水颜色不同，执行洪水填充
    if (currentColor !== cell.color) {
      console.log(`颜色不同，执行洪水填充`)
      // 更新所有已淹没区域的颜色为新颜色
      const newBoard = [...this.data.board]

      // 先将所有已淹没的格子更新为新颜色
      for (const coords of this.data.floodedCells) {
        const [r, c] = coords.split(',').map(Number)
        console.log(`更新洪水区域格子(${r}, ${c})颜色为${cell.color}`)
        newBoard[r][c].color = cell.color
      }

      try {
        this.setData({
          board: newBoard,
          moves: this.data.moves + 1
        }, () => {
          console.log(`状态更新成功，当前步数: ${this.data.moves}`)
          // 然后执行洪水填充，扩展洪水区域
          // 检查所有与洪水区域相邻的格子，找出颜色与新颜色相同的格子进行填充
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
          const visited = new Set(this.data.floodedCells)
          console.log(`当前洪水区域: ${Array.from(visited).join(', ')}`)

          // 遍历所有洪水区域的格子
          for (const coords of this.data.floodedCells) {
            const [r, c] = coords.split(',').map(Number)
            console.log(`检查洪水区域格子(${r}, ${c})的相邻格子`)

            // 检查相邻格子
            for (const [dx, dy] of directions) {
              const newRow = r + dx
              const newCol = c + dy
              console.log(`检查相邻格子(${newRow}, ${newCol})`)

              // 如果相邻格子有效且颜色与新颜色相同且未被访问过，执行洪水填充
              if (newRow >= 0 && newRow < this.data.gridSize &&
                  newCol >= 0 && newCol < this.data.gridSize) {
                console.log(`相邻格子(${newRow}, ${newCol})在边界内`)

                if (!this.data.board[newRow][newCol].isObstacle) {
                  console.log(`相邻格子(${newRow}, ${newCol})不是障碍物`)

                  if (this.data.board[newRow][newCol].color === cell.color) {
                    console.log(`相邻格子(${newRow}, ${newCol})颜色与新颜色相同`)

                    if (!visited.has(`${newRow},${newCol}`)) {
                      console.log(`相邻格子(${newRow}, ${newCol})未被访问过，执行洪水填充`)
                      this.floodFill(newRow, newCol, cell.color, cell.color)
                      visited.add(`${newRow},${newCol}`)
                    } else {
                      console.log(`相邻格子(${newRow}, ${newCol})已被访问过，跳过`)
                    }
                  } else {
                    console.log(`相邻格子(${newRow}, ${newCol})颜色与新颜色不同，跳过`)
                  }
                } else {
                  console.log(`相邻格子(${newRow}, ${newCol})是障碍物，跳过`)
                }
              } else {
                console.log(`相邻格子(${newRow}, ${newCol})超出边界，跳过`)
              }
            }
          }

          // 检查是否获胜 - 移到回调内确保在洪水填充后检查
          console.log(`洪水填充完成，检查是否获胜`)
          this.checkWinCondition()
        })
      } catch (error) {
        console.error(`状态更新失败: ${error.message}`)
      }
    } else {
      console.log(`点击格子颜色与当前洪水颜色相同，不执行操作`)
    }
  },

  // 检查胜利条件
  checkWinCondition() {
    console.log(`检查胜利条件`)
    // 检查是否所有非障碍格子都已被洪水覆盖
    let totalCells = 0
    let floodedCells = 0
    let obstacleCells = 0
    let unfloodedCells = []

    for (let i = 0; i < this.data.board.length; i++) {
      for (let j = 0; j < this.data.board[i].length; j++) {
        totalCells++
        const cell = this.data.board[i][j]
        if (cell.isObstacle) {
          obstacleCells++
        } else if (this.data.floodedCells.has(`${i},${j}`)) {
          floodedCells++
        } else {
          unfloodedCells.push(`(${i},${j})`)
        }
      }
    }

    console.log(`总格子数: ${totalCells}, 障碍物数: ${obstacleCells}, 已淹没格子数: ${floodedCells}`)
    console.log(`未淹没格子: ${unfloodedCells.join(', ')}`)

    const allFlooded = floodedCells + obstacleCells === totalCells
    console.log(`是否全部淹没: ${allFlooded}`)

    if (allFlooded) {
      console.log(`所有格子已淹没，获胜!`)
      this.gameOver(true)
    } else if (this.data.moves >= this.data.maxMoves) {
      console.log(`步数用尽，失败!`)
      this.gameOver(false)
    } else {
      console.log(`游戏继续，当前步数: ${this.data.moves}/${this.data.maxMoves}`)
    }
  },

  // 该函数已经被禁用，因为我们不允许直接改变洪水区域的颜色
  // 玩家只能通过点击与洪水区域相邻的格子来改变颜色
  selectColor() {
    // 添加抖动动画提示无效操作
    this.setData({ isShaking: true })
    setTimeout(() => {
      this.setData({ isShaking: false })
    }, 500)
  },

  restartGame() {
    this.initGame()
  },

  showRules() {
    this.setData({ showRulesModal: true })
  },

  closeRulesModal() {
    this.setData({ showRulesModal: false })
  },

  gameOver(isWin) {
    this.setData({
      showGameOverModal: true,
      isWin
    })
  }
})

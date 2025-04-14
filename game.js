// 游戏状态管理和洪水填充算法实现
class FloodGame {
    constructor() {
        this.board = [];
        this.size = 10;
        this.colors = 6;
        this.hasObstacles = false;
        this.hasSpecialCells = false;
        this.infiniteMoves = false;
        this.moves = 0;
        this.maxMoves = 25;
        this.floodedCells = new Set();
        this.colorPalette = [
            '#FF5252', // Red
            '#4CAF50', // Green
            '#2196F3', // Blue
            '#FFEB3B', // Yellow
            '#9C27B0', // Purple
            '#FF9800', // Orange
            '#00BCD4', // Cyan
            '#795548'  // Brown
        ];
    }

    // 初始化游戏板
    initBoard() {
        this.board = [];
        this.moves = 0;
        this.floodedCells.clear();
        
        // 创建游戏板
        for (let row = 0; row < this.size; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.size; col++) {
                const colorIndex = Math.floor(Math.random() * this.colors);
                const isObstacle = this.hasObstacles && Math.random() < 0.05 && !(row === 0 && col === 0);
                const isSpecial = !isObstacle && this.hasSpecialCells && Math.random() < 0.05 && !(row === 0 && col === 0);
                
                this.board[row][col] = {
                    color: isObstacle ? '#000000' : this.colorPalette[colorIndex],
                    isObstacle,
                    isSpecial
                };
            }
        }

        // 初始化洪水区域
        if (!this.board[0][0].isObstacle) {
            this.floodedCells.add('0,0');
            this.floodFill(0, 0, this.board[0][0].color);
        }
    }

    // 获取当前洪水颜色
    getCurrentFloodColor() {
        for (const coords of this.floodedCells) {
            const [row, col] = coords.split(',').map(Number);
            return this.board[row][col].color;
        }
        return null;
    }

    // 检查是否是有效的移动
    isValidMove(row, col, newColor) {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return false;
        }
        if (this.board[row][col].isObstacle) {
            return false;
        }
        const currentColor = this.getCurrentFloodColor();
        return newColor !== currentColor;
    }

    // 洪水填充算法
    floodFill(row, col, newColor) {
        const currentColor = this.board[row][col].color;
        if (currentColor === newColor) {
            return;
        }

        // 更新当前格子的颜色
        this.board[row][col].color = newColor;
        this.floodedCells.add(`${row},${col}`);

        // 检查相邻格子
        const directions = [
            [-1, 0], // 上
            [1, 0],  // 下
            [0, -1], // 左
            [0, 1]   // 右
        ];

        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            // 检查边界和障碍物
            if (newRow >= 0 && newRow < this.size && 
                newCol >= 0 && newCol < this.size && 
                !this.board[newRow][newCol].isObstacle && 
                this.board[newRow][newCol].color === currentColor) {
                this.floodFill(newRow, newCol, newColor);
            }
        }
    }

    // 执行移动
    makeMove(row, col) {
        const newColor = this.board[row][col].color;
        if (!this.isValidMove(row, col, newColor)) {
            return false;
        }

        this.moves++;
        const currentColor = this.getCurrentFloodColor();
        const floodedCellsArray = Array.from(this.floodedCells);
        
        for (const coords of floodedCellsArray) {
            const [r, c] = coords.split(',').map(Number);
            this.floodFill(r, c, newColor);
        }

        return true;
    }

    // 检查游戏是否结束
    checkGameStatus() {
        // 检查是否超过最大步数
        if (!this.infiniteMoves && this.moves >= this.maxMoves) {
            return { isGameOver: true, isWin: false };
        }

        // 检查是否所有非障碍格子都被淹没
        const firstColor = this.getCurrentFloodColor();
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (!this.board[row][col].isObstacle && 
                    this.board[row][col].color !== firstColor) {
                    return { isGameOver: false, isWin: false };
                }
            }
        }

        return { isGameOver: true, isWin: true };
    }

    // 更新游戏设置
    updateSettings(settings) {
        this.size = settings.size || this.size;
        this.colors = settings.colors || this.colors;
        this.hasObstacles = settings.hasObstacles || this.hasObstacles;
        this.hasSpecialCells = settings.hasSpecialCells || this.hasSpecialCells;
        this.infiniteMoves = settings.infiniteMoves || this.infiniteMoves;
        this.maxMoves = Math.floor(this.size * 1.5 + this.colors);
    }
}

// 导出游戏类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloodGame;
} else if (typeof window !== 'undefined') {
    window.FloodGame = FloodGame;
}
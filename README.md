# 消消乐游戏 (pdd-159)

一个基于 React + TypeScript + Vite 的前端消消乐游戏。

## 玩法

- 8x8 彩色方块网格，每次随机生成五种颜色的方块
- 点击两个相邻的方块交换位置
- 交换后若形成三个或更多同色方块连成一线，即可消除得分
- 四个以上连消会触发特效（直线消除或爆炸消除）
- 每局有步数限制，步数用完即结算总分
- 达到一定分数可过关进入下一局，网格中会出现障碍物石头块
- 石头块不能被普通消除但可以被特效炸掉

## 运行方式

```bash
npm install
npm run dev
```

然后打开浏览器访问 `http://localhost:5173`。

## 技术栈

- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (状态管理)
- Lucide React (图标)

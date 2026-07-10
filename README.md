# 方块仓库（Mini Sokoban）

一个纯 HTML、CSS 和 JavaScript 编写的推箱子小游戏，无第三方依赖，打开网页即可游玩。

## 功能

- 三个渐进式关卡
- 支持方向键、WASD、屏幕按钮和滑动操作
- 步数与箱子进度统计
- 撤销和重新开始
- 自适应手机与桌面屏幕

## 本地运行

直接双击 `index.html`，或在项目目录启动任意静态文件服务器。

例如使用 Python：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 操作方式

移动玩家并推动木箱，将所有木箱放到黄色目标点。箱子只能推动，不能拉动。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript

## License

[MIT](LICENSE)

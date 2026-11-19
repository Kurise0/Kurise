# KURISE · WORLDLINE SPA v11

无需框架或构建工具的静态个人网站。基于用户自行调整内容的 v10 源码迭代，保留原本的五章节、全屏上下透明揭幕、页内左右揭幕、Canvas 粒子重组、世界线 Loading、双语和日夜主题。

## v11 更新

- **Contact 动态背景**：使用单独提供的 8 秒视频作为 Contact 的全屏循环背景，附带首帧海报及适应日夜模式的渐变遮罩，文字保持左对齐。只有进入 Contact（或转场揭开 Contact）时才给视频设置来源并播放，离开后暂停。视频封装已 faststart，且移除了不需要的音轨，没有重编码画面。
- **移除 Eridanus**：彻底删除 Eridanus 分镜和对应多语言内容；Project 现为 **3 个分镜**（构想 → Ordering → 下一次实验），并同步更新编号、按钮数量、项目粒子图案映射和进度逻辑。你修改过的其他项目和介绍文字不覆盖。
- **About 统一排版**：Research 与 Profile 采用相同的主标题/右侧介绍/底部档案信息布局。原有两项研究兴趣内容与展开交互保留；小屏幕或矮视口可在内部阅读区域滚动。
- **精简导航提示**：去掉全站固定的 SCROLL / NEXT 提示和显眼的滚轮、滑动说明。Competition、Project 仅保留无文字的**从左往右移动、逐渐消失的细线动画**，同时保留有用的序号和左右按钮，保持可操作性。
- **资源版本**：更新静态资源查询参数为 `?v=11`，避免新旧样式与脚本被缓存混用。Loading 仍等待首页关键资源，不会预加载 Contact 的视频。

## 本地运行

解压后在**含 `index.html` 的文件夹**中执行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。首次访问会自动进入 `loading.html`，同一标签页内刷新默认不重复显示开场。想重播可以访问 `http://localhost:8000/loading.html?dest=index`。

## GitHub Pages

将此目录内的 `index.html`、`loading.html`、`assets/`、`css/`、`js/`、`.nojekyll` 等上传到 GitHub 仓库根目录。进入 **Settings → Pages → Deploy from a branch → main → / (root)**。

若使用项目仓库，网址通常为 `https://USERNAME.github.io/REPO/`；若仓库名为 `USERNAME.github.io`，网址通常为 `https://USERNAME.github.io/`。本项目使用相对资源路径，适用于两种部署方式。浏览器直接打开 `file://` 文件也有降级兼容，但 HTTP 服务体验更稳定。

## 上线前建议核对

- Contact 视频在 Chrome/Firefox/手机浏览器内能否正常静音自动播放；不允许自动播放时应显示海报。
- `#about` 中 Profile 与 Research 的按钮切换，以及较矮屏幕上的全文可访问性。
- Project 的 3 张分镜、左右箭头、鼠标滚轮/手势、Canvas 重组、离开再返回的页内索引。
- Contact 视频的可用授权。上传到公开仓库并不等于拥有视频的公开传播版权。
- 各平台的 Kaggle / GitHub / X / LinkedIn 地址，以及竞赛数字、个人介绍等是否准确。

## 测试命令

```bash
python tests/test-static.py
node tests/test-loader.cjs
```

上述为本地静态/模拟逻辑检查，不等同于真实浏览器视觉验收。

---

*KURISE — Research in Motion.*

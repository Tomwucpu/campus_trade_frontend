# 校园二手交易平台 - 前端 (UsedTrade Frontend)

这是一个面向校园场景的二手交易平台前端客户端，项目采用 **uni-app + Vue 3** 框架构建，支持一份代码编译发布多端（推荐目标为 H5、微信小程序）。本工程配合后端的 RESTful API，实现了完整的二手交易与用户互动闭环。

## 🚀 技术栈选型

- **核心框架**: uni-app + Vue 3 (Composition API)
- **UI 组件库**: `@dcloudio/uni-ui`
- **状态管理**: 详见 `store` 目录内部实现
- **图标资源**: Bootstrap Icons
- **网络请求**: 封装了统一的 `uni.request` 进行 API 交互 (详见 `utils/request.js`)
- **开发工具**: 推荐使用 [HBuilderX](https://www.dcloud.io/hbuilderx.html)

## 🌟 核心功能模块

前端根据用户交互流转构建了以下页面及其配套组件：

1. **首页模块 (`pages/index`)**
   - 瀑布流/列表式的商品展示。
   - 搜索栏及分类导航功能。
2. **商品模块 (`pages/goods`)**
   - **发布商品 (`publish.vue`)**: 支持图片上传预览。利用了后端的 AI 智能估价组件 (`GoodsAiValuationPanel.vue`) 协助定价。
   - **商品详情 (`detail.vue`)**: 轮播图预览、卖家信息查看、一键发起聊天或立即购买。
   - **我的商品 (`my.vue`)**: 卖家库存及上下架管理。
3. **交易与订单 (`pages/order`)**
   - 标准电商闭环呈现，模拟支付对接。
   - 订单列表与状态展示。
4. **即时通讯 (`pages/chat`)**
   - 站内信/私聊界面展现，方便买卖双方沟通。
5. **用户中心 (`pages/user`)**
   - 用户注册、登录态维持。
   - 校园信息绑定 (`CampusBindingWidget.vue`)，辅助定位校验。
   - 收藏夹及消息总览。

## 📂 核心目录结构

```text
frontend/
├── api/             # 按业务模块划分的后端 API 接口对接 (auth, goods, order 等)
├── components/      # 全局复用的自定义组件 (Ai估价面板、商品卡片、空状态提示等)
├── pages/           # 具体页面 (商品中心、订单、用户中心、聊天等)
├── store/           # 集中状态管理 (用户登录态、订单状态、商品缓存)
├── utils/           # 通用工具类 (平台适配引擎、统一网络请求封装 request.js、主题等)
├── App.vue          # 应用入口，配置全局样式及应用生命周期
├── main.js          # Vue 应用实力初始化，挂载各个插件
├── manifest.json    # 多端应用配置 (AppID、打包设置、微信小程序配置)
└── pages.json       # 全局路由、Tab Bar 及其页面导航栏样式配置
```

## 🛠️ 环境要求与配置准备

1. **开发工具**: 请务必下载安装最新的 [HBuilderX](https://www.dcloud.io/hbuilderx.html)（推荐包含 App 开发环境的正式版）。
2. **API 接口地址配置**: 
   在实际启动之前，请确认 `utils/request.js` 中配置的 `BASE_URL` 是否指向了你本地或远端的后端服务地址（默认如 `http://localhost:8080/api`）。

## 🏃‍♂️ 快速开始

1. **打开项目**: 启动 HBuilderX，选择 `文件 -> 导入 -> 从本地目录导入`，选择本 `frontend` 文件夹。
2. **安装依赖**(如有需要): 如果提示需要安装 npm 包，请在 `frontend` 目录下运行 `npm install`。
3. **运行至浏览器 (H5测试环境)**:
   - 在 HBuilderX 中点击上方菜单 `运行 -> 运行到浏览器 -> Chrome (或其他浏览器)`。
   - 修改代码后 HBuilderX 会自动开启热更新与重新编译。
4. **运行至微信小程序 (可选)**:
   - 确保安装了“微信开发者工具”。
   - 在 HBuilderX 中填写你的小程序 AppID（于 `manifest.json` 下的 微信小程序配置 中）。
   - 在 HBuilderX 中点击 `运行 -> 运行到小程序模拟器 -> 微信开发者工具`。

## 📖 相关文档

本前端对应后端的详细系统架构及接口设计，可参考根目录 `interface_documentation` 下的各项文档：
- [前端与后端 API 接口约定文档](../../interface_documentation/前端接口文档.md)
- [页面 UI 与系统设计文档](../../interface_documentation/二手交易平台系统设计文档.md)

*请注意：在编译小程序与 App 时可能会存在跨端及 API 适配差异，如有针对 H5 的 Mock 可以直接使用 HBuilder 内置的 Chrome 进行调试。*
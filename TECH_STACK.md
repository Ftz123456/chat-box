# 项目技术栈文档

## 项目概述

本项目是一个基于 Next.js 的智能占卜助手应用，提供八字、紫微斗数、马克思主义分析等多种占卜分析功能。

## 核心技术栈

### 前端框架

- **Next.js** `15.5.2`
  - 使用 App Router 架构
  - 服务端渲染 (SSR) 和静态生成 (SSG)
  - API Routes 用于后端接口

- **React** `19.1.0`
  - 最新版本的 React 框架
  - 使用 React Context API 进行状态管理
  - 支持 React Server Components

- **React DOM** `19.1.0`
  - React 的 DOM 渲染库

### 编程语言

- **TypeScript** `^5`
  - 类型安全的 JavaScript 超集
  - 严格的类型检查配置
  - 支持路径别名 (`@/*`)

### 样式方案

- **Tailwind CSS** `^4`
  - 实用优先的 CSS 框架
  - 使用 PostCSS 进行构建
  - 响应式设计支持

- **@tailwindcss/typography** `^0.5.16`
  - Tailwind CSS 的排版插件
  - 用于 Markdown 内容的美化

- **@tailwindcss/postcss** `^4`
  - Tailwind CSS 的 PostCSS 插件

### 数据库

- **MySQL**
  - 关系型数据库
  - 使用阿里云 RDS 服务

- **mysql2** `^3.15.2`
  - Node.js MySQL 客户端
  - 支持 Promise 和连接池
  - 使用连接池管理数据库连接

### 认证与安全

- **jsonwebtoken** `^9.0.2`
  - JWT (JSON Web Token) 实现
  - 用于用户身份验证和会话管理

- **bcryptjs** `^3.0.2`
  - 密码哈希加密库
  - 用于安全存储用户密码

### HTTP 客户端

- **axios** `^1.11.0`
  - 基于 Promise 的 HTTP 客户端
  - 用于前端 API 请求

- **node-fetch** `^3.3.2`
  - Node.js 的 fetch API 实现
  - 用于服务端 HTTP 请求

### 工具库

- **lodash** `^4.17.21`
  - JavaScript 实用工具库
  - 提供常用的工具函数

- **uuid** `^13.0.0`
  - 生成唯一标识符
  - 用于生成会话 ID 等

- **dotenv** `^17.2.3`
  - 环境变量管理
  - 用于加载 `.env` 配置文件

### 易学相关库

- **lunar-calendar** `^0.1.4`
  - 农历日历转换库

- **lunar-javascript** `^1.7.6`
  - JavaScript 版本的农历库

- **lunar-typescript** `^1.8.5`
  - TypeScript 版本的农历库
  - 用于日期转换和计算

- **react-iztro** `^1.3.7`
  - React 紫微斗数库
  - 用于紫微斗数排盘和分析

### Markdown 渲染

- **react-markdown** `^10.1.0`
  - React 的 Markdown 渲染组件
  - 用于渲染 AI 返回的 Markdown 格式内容

- **remark-gfm** `^4.0.1`
  - GitHub Flavored Markdown 支持
  - 扩展 Markdown 功能（表格、任务列表等）

### 字体

- **Inter** (通过 `next/font/google`)
  - Google Fonts 提供的现代无衬线字体
  - 自动优化和加载

## 开发工具

### 类型定义

- `@types/node` `^20` - Node.js 类型定义
- `@types/react` `^19` - React 类型定义
- `@types/react-dom` `^19` - React DOM 类型定义
- `@types/bcryptjs` `^3.0.0` - bcryptjs 类型定义
- `@types/jsonwebtoken` `^9.0.10` - jsonwebtoken 类型定义
- `@types/uuid` `^11.0.0` - uuid 类型定义
- `@types/lodash` `^4.17.20` - lodash 类型定义

### 构建工具

- **PostCSS** - CSS 后处理器
- **Next.js 内置构建系统** - 基于 Webpack 和 SWC

## 项目结构

```
src/
├── app/              # Next.js App Router 页面和路由
│   ├── api/          # API 路由
│   ├── account/      # 账户页面
│   ├── bazi/         # 八字页面
│   ├── login/        # 登录页面
│   ├── register/     # 注册页面
│   └── ziwei/        # 紫微斗数页面
├── components/        # React 组件
├── contexts/          # React Context 提供者
└── lib/              # 工具库和业务逻辑
    ├── auth.ts       # 认证相关
    ├── database.ts   # 数据库连接
    ├── baziParser.ts # 八字解析
    └── messageService.ts # 消息服务
```

## 数据库表结构

- **users** - 用户表
- **user_sessions** - 用户会话表
- **chat_messages** - 聊天记录表

## 环境变量

项目使用以下环境变量（通过 `.env` 文件配置）：

- `DB_HOST` - 数据库主机地址
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称
- `DB_PORT` - 数据库端口

## 开发脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run init-db` - 初始化数据库表
- `npm run migrate:add-birthday-bazi` - 数据库迁移脚本

## 技术特点

1. **全栈框架**: 使用 Next.js 实现前后端一体化开发
2. **类型安全**: 全面使用 TypeScript 确保代码质量
3. **现代化 UI**: 使用 Tailwind CSS 实现响应式设计
4. **安全认证**: JWT + bcryptjs 实现安全的用户认证
5. **连接池管理**: 使用 MySQL 连接池优化数据库性能
6. **易学集成**: 集成多个易学相关库实现专业功能

## 版本信息

- Node.js: 建议使用 Node.js 20+
- Next.js: 15.5.2
- React: 19.1.0
- TypeScript: 5.x

## 依赖管理

项目支持多种包管理器：
- npm
- pnpm (推荐，项目包含 `pnpm-lock.yaml`)
- yarn
- bun

---

*最后更新: 2024年*


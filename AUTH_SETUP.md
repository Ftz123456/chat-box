# 用户认证系统设置指南

## 🚀 快速开始

### 1. 环境配置

创建 `.env.local` 文件在项目根目录：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=chat_box
DB_PORT=3306

# JWT密钥（生产环境请使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Next.js环境
NODE_ENV=development
```

### 2. 数据库初始化

确保MySQL服务正在运行，然后执行：

```bash
npm run init-db
```

这将创建以下表：
- `users` - 用户信息表
- `user_sessions` - 用户会话表
- `chat_messages` - 聊天记录表

### 3. 启动应用

```bash
npm run dev
```

## 📋 功能特性

### ✅ 已实现功能

1. **用户注册**
   - 用户名、邮箱、密码验证
   - 密码加密存储
   - 重复用户检查

2. **用户登录**
   - 邮箱/密码登录
   - JWT token认证
   - 会话管理

3. **用户界面**
   - 响应式登录/注册页面
   - 侧边栏用户信息显示
   - 登出功能

4. **安全特性**
   - 密码bcrypt加密
   - JWT token验证
   - HTTP-only cookies
   - 会话过期管理

## 🔧 API接口

### 注册用户
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "user@example.com",
  "password": "密码"
}
```

### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "密码"
}
```

### 获取用户信息
```
GET /api/auth/me
Cookie: auth-token=your_jwt_token
```

### 用户登出
```
POST /api/auth/logout
Cookie: auth-token=your_jwt_token
```

## 🎨 页面路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/account` - 用户中心（待实现）

## 🔒 安全注意事项

1. **生产环境配置**
   - 更改默认JWT密钥
   - 使用强密码策略
   - 启用HTTPS

2. **数据库安全**
   - 使用专用数据库用户
   - 限制数据库权限
   - 定期备份数据

3. **环境变量**
   - 不要提交 `.env.local` 到版本控制
   - 使用环境变量管理敏感信息

## 🐛 故障排除

### 数据库连接失败
1. 检查MySQL服务是否运行
2. 验证数据库配置信息
3. 确认数据库用户权限

### 登录失败
1. 检查用户是否已注册
2. 验证密码是否正确
3. 查看控制台错误信息

### Token验证失败
1. 检查JWT密钥配置
2. 验证token是否过期
3. 确认cookie设置正确

## 📝 开发说明

### 添加新的认证功能

1. 在 `src/lib/auth.ts` 中添加新函数
2. 在 `src/app/api/auth/` 中创建API路由
3. 在 `src/contexts/AuthContext.tsx` 中更新上下文
4. 在UI组件中使用新的认证功能

### 数据库表结构

#### users表
- `id` - 主键
- `username` - 用户名（唯一）
- `email` - 邮箱（唯一）
- `password` - 加密密码
- `avatar` - 头像URL
- `created_at` - 创建时间
- `updated_at` - 更新时间
- `last_login` - 最后登录时间
- `is_active` - 是否激活

#### user_sessions表
- `id` - 主键
- `user_id` - 用户ID（外键）
- `session_token` - 会话token（唯一）
- `expires_at` - 过期时间
- `created_at` - 创建时间

#### chat_messages表
- `id` - 主键
- `user_id` - 用户ID（外键）
- `chat_type` - 聊天类型
- `role` - 角色（user/assistant）
- `content` - 消息内容
- `created_at` - 创建时间

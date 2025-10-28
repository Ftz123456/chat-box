const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    // 创建数据库
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'chat_box'}`);
    console.log('数据库创建成功');

    // 使用数据库
    await connection.query(`USE ${process.env.DB_NAME || 'chat_box'}`);

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
        phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
        password VARCHAR(255) NOT NULL COMMENT '密码哈希',
        avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
        birthday DATETIME NULL COMMENT '生日（精确到时分）',
        bazi_text LONGTEXT NULL COMMENT '八字信息长文本',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        last_login TIMESTAMP NULL COMMENT '最后登录时间',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('用户表创建成功');

    // 创建用户会话表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        user_id INT NOT NULL COMMENT '用户ID',
        session_token VARCHAR(255) UNIQUE NOT NULL COMMENT '会话令牌',
        expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('用户会话表创建成功');

    // 创建用户聊天记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        user_id INT NOT NULL COMMENT '用户ID',
        chat_type ENUM('digital', 'comprehensive', 'bazi', 'ziwei', 'marxist') NOT NULL COMMENT '聊天类型',
        role ENUM('user', 'assistant') NOT NULL COMMENT '消息角色',
        content TEXT NOT NULL COMMENT '消息内容',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('聊天记录表创建成功');

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initDatabase();

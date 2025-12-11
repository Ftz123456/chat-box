const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrateEmailToPhone() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'chat_box'
  });

  try {
    console.log('开始迁移数据库：将email字段改为phone字段...');

    // 检查是否存在email字段
    const [emailColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'
    `, [process.env.DB_NAME || 'chat_box']);

    // 检查是否存在phone字段
    const [phoneColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
    `, [process.env.DB_NAME || 'chat_box']);

    if (emailColumns.length > 0 && phoneColumns.length === 0) {
      console.log('发现email字段，开始迁移...');

      // 添加phone字段
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20) UNIQUE NULL AFTER username
      `);
      console.log('已添加phone字段');

      // 将现有的email数据迁移到phone字段（这里需要根据实际情况调整）
      // 注意：这里假设email字段中的数据是有效的手机号格式
      // 如果不是，需要手动处理数据
      await connection.execute(`
        UPDATE users 
        SET phone = email 
        WHERE email IS NOT NULL AND email != ''
      `);
      console.log('已将email数据迁移到phone字段');

      // 删除email字段
      await connection.execute(`
        ALTER TABLE users 
        DROP COLUMN email
      `);
      console.log('已删除email字段');

      // 将phone字段设置为NOT NULL
      await connection.execute(`
        ALTER TABLE users 
        MODIFY COLUMN phone VARCHAR(20) UNIQUE NOT NULL
      `);
      console.log('已将phone字段设置为NOT NULL');

      console.log('数据库迁移完成！');
    } else if (phoneColumns.length > 0) {
      console.log('phone字段已存在，数据库可能已经迁移过了。');
    } else {
      console.log('未发现email字段，数据库结构正常。');
    }

  } catch (error) {
    console.error('数据库迁移失败:', error);
  } finally {
    await connection.end();
  }
}

migrateEmailToPhone();

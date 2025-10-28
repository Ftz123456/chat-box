const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'chat_box',
  });

  try {
    console.log('开始迁移: 添加 users.birthday 与 users.bazi_text ...');

    // 检查列是否存在并添加
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'chat_box']);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    if (!existingColumns.includes('birthday')) {
      await connection.execute(`
        ALTER TABLE users 
          ADD COLUMN birthday DATETIME NULL COMMENT '生日（精确到时分）' AFTER avatar
      `);
      console.log('✓ 添加 birthday 列');
    } else {
      console.log('✓ birthday 列已存在');
    }

    if (!existingColumns.includes('bazi_text')) {
      await connection.execute(`
        ALTER TABLE users 
          ADD COLUMN bazi_text LONGTEXT NULL COMMENT '八字信息长文本' AFTER birthday
      `);
      console.log('✓ 添加 bazi_text 列');
    } else {
      console.log('✓ bazi_text 列已存在');
    }

    // 添加注释到现有列（更新）
    try {
      await connection.execute(`
        ALTER TABLE users 
          MODIFY COLUMN birthday DATETIME NULL COMMENT '生日（精确到时分）'
      `);
      await connection.execute(`
        ALTER TABLE users 
          MODIFY COLUMN bazi_text LONGTEXT NULL COMMENT '八字信息长文本'
      `);
    } catch (e) {
      // 如果列不存在，上面的添加已经处理了
    }

    console.log('迁移完成！');
  } catch (e) {
    console.error('迁移失败:', e.message);
  } finally {
    await connection.end();
  }
}

migrate();



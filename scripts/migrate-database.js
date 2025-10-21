const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'chat_box',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    console.log('开始数据库迁移...');

    // 创建conversations表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        chat_type ENUM('digital', 'comprehensive', 'bazi', 'ziwei', 'marxist') NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        first_message TEXT DEFAULT NULL,
        message_count INT DEFAULT 0,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_type (user_id, chat_type),
        INDEX idx_last_message (last_message_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ conversations表创建成功');

    // 检查chat_messages表是否有conversation_id列
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'chat_messages' AND COLUMN_NAME = 'conversation_id'
    `, [process.env.DB_NAME || 'chat_box']);

    if (columns.length === 0) {
      // 添加conversation_id列
      await connection.execute(`
        ALTER TABLE chat_messages 
        ADD COLUMN conversation_id INT DEFAULT NULL AFTER id,
        ADD INDEX idx_conversation (conversation_id)
      `);
      console.log('✅ 添加conversation_id列成功');

      // 为现有消息创建对话记录
      const [existingMessages] = await connection.execute(`
        SELECT DISTINCT user_id, chat_type, DATE(created_at) as date
        FROM chat_messages 
        WHERE conversation_id IS NULL
        ORDER BY user_id, chat_type, date
      `);

      for (const group of existingMessages) {
        // 为每个用户、聊天类型、日期的组合创建对话
        const [conversation] = await connection.execute(`
          INSERT INTO conversations (user_id, chat_type, created_at, last_message_at)
          VALUES (?, ?, ?, ?)
        `, [group.user_id, group.chat_type, group.date, group.date]);

        const conversationId = conversation.insertId;

        // 更新该组的所有消息
        await connection.execute(`
          UPDATE chat_messages 
          SET conversation_id = ?
          WHERE user_id = ? AND chat_type = ? AND DATE(created_at) = ?
        `, [conversationId, group.user_id, group.chat_type, group.date]);

        // 更新对话统计信息
        const [messageCount] = await connection.execute(`
          SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id = ?
        `, [conversationId]);

        const [firstMessage] = await connection.execute(`
          SELECT content FROM chat_messages 
          WHERE conversation_id = ? AND role = 'user' 
          ORDER BY created_at ASC LIMIT 1
        `, [conversationId]);

        await connection.execute(`
          UPDATE conversations 
          SET message_count = ?, first_message = ?, title = ?
          WHERE id = ?
        `, [
          messageCount[0].count,
          firstMessage[0]?.content || '',
          (firstMessage[0]?.content?.substring(0, 50) + '...') || `${group.chat_type}对话`,
          conversationId
        ]);
      }

      console.log('✅ 现有消息迁移完成');

      // 设置conversation_id为NOT NULL
      await connection.execute(`
        ALTER TABLE chat_messages 
        MODIFY COLUMN conversation_id INT NOT NULL
      `);
      console.log('✅ conversation_id列设置为NOT NULL');
    } else {
      console.log('✅ conversation_id列已存在，跳过迁移');
    }

    console.log('🎉 数据库迁移完成！');

  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateDatabase().catch(console.error);

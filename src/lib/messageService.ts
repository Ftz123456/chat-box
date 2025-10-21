import pool from './database';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationData {
  userId: number;
  chatType: 'digital' | 'comprehensive' | 'bazi' | 'ziwei' | 'marxist';
  messages: Message[];
  conversationId?: number;
}

export interface SavedMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

/**
 * 获取或创建对话会话
 */
export async function getOrCreateConversation(
  userId: number, 
  chatType: 'digital' | 'comprehensive' | 'bazi' | 'ziwei' | 'marxist',
  conversationId?: number
): Promise<number> {
  if (conversationId) {
    // 验证对话是否属于该用户
    const [rows] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ? AND is_active = TRUE',
      [conversationId, userId]
    );
    
    if ((rows as any[]).length > 0) {
      return conversationId;
    }
  }

  // 创建新对话
  const [result] = await pool.execute(
    'INSERT INTO conversations (user_id, chat_type) VALUES (?, ?)',
    [userId, chatType]
  );
  
  return (result as any).insertId;
}

/**
 * 保存消息到数据库
 */
export async function saveMessage(
  conversationId: number,
  userId: number,
  chatType: 'digital' | 'comprehensive' | 'bazi' | 'ziwei' | 'marxist',
  role: 'user' | 'assistant',
  content: string
): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO chat_messages (conversation_id, user_id, chat_type, role, content) VALUES (?, ?, ?, ?, ?)',
    [conversationId, userId, chatType, role, content]
  );
  
  return (result as any).insertId;
}

/**
 * 更新对话会话信息
 */
export async function updateConversation(
  conversationId: number,
  firstMessage?: string,
  title?: string
): Promise<void> {
  const updateFields = [];
  const values = [];
  
  if (firstMessage) {
    updateFields.push('first_message = ?');
    values.push(firstMessage);
  }
  
  if (title) {
    updateFields.push('title = ?');
    values.push(title);
  }
  
  // 更新消息计数和最后消息时间
  updateFields.push('message_count = (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = ?)');
  updateFields.push('last_message_at = NOW()');
  values.push(conversationId);
  
  if (updateFields.length > 0) {
    values.push(conversationId);
    await pool.execute(
      `UPDATE conversations SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

/**
 * 保存对话消息（通用方法）
 */
export async function saveConversationMessages(
  userId: number,
  chatType: 'digital' | 'comprehensive' | 'bazi' | 'ziwei' | 'marxist',
  messages: Message[],
  conversationId?: number
): Promise<{ conversationId: number; savedMessages: SavedMessage[] }> {
  try {
    // 获取或创建对话
    const convId = await getOrCreateConversation(userId, chatType, conversationId);
    
    const savedMessages: SavedMessage[] = [];
    
    // 保存所有消息
    for (const message of messages) {
      const messageId = await saveMessage(convId, userId, chatType, message.role, message.content);
      
      savedMessages.push({
        id: messageId,
        conversationId: convId,
        role: message.role,
        content: message.content,
        created_at: new Date()
      });
    }
    
    // 更新对话信息
    if (messages.length > 0) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage?.content.substring(0, 50) + '...' || `${chatType}对话`;
      
      await updateConversation(convId, firstUserMessage?.content, title);
    }
    
    return {
      conversationId: convId,
      savedMessages
    };
  } catch (error) {
    console.error('保存对话消息失败:', error);
    throw error;
  }
}

/**
 * 获取对话的所有消息
 */
export async function getConversationMessages(
  conversationId: number,
  userId: number
): Promise<SavedMessage[]> {
  const [rows] = await pool.execute(`
    SELECT 
      cm.id,
      cm.conversation_id,
      cm.role,
      cm.content,
      cm.created_at
    FROM chat_messages cm
    JOIN conversations c ON cm.conversation_id = c.id
    WHERE cm.conversation_id = ? AND c.user_id = ? AND c.is_active = TRUE
    ORDER BY cm.created_at ASC
  `, [conversationId, userId]);
  
  return (rows as any[]).map(row => ({
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at
  }));
}

/**
 * 获取用户的所有对话历史
 */
export async function getUserConversations(
  userId: number,
  limit: number = 20
): Promise<any[]> {
  const [rows] = await pool.execute(`
    SELECT 
      id,
      chat_type,
      title,
      first_message,
      message_count,
      last_message_at,
      created_at
    FROM conversations 
    WHERE user_id = ? AND is_active = TRUE
    ORDER BY last_message_at DESC
    LIMIT ${limit}
  `, [userId]);
  
  return (rows as any[]).map(row => ({
    id: row.id,
    chat_type: row.chat_type,
    title: row.title,
    first_message: row.first_message,
    message_count: row.message_count,
    last_message_at: row.last_message_at,
    created_at: row.created_at
  }));
}

/**
 * 获取特定对话的详细信息
 */
export async function getConversationDetails(
  conversationId: number,
  userId: number
): Promise<{ conversation: any; messages: SavedMessage[] } | null> {
  // 获取对话信息
  const [convRows] = await pool.execute(`
    SELECT 
      id,
      chat_type,
      title,
      first_message,
      message_count,
      last_message_at,
      created_at
    FROM conversations 
    WHERE id = ? AND user_id = ? AND is_active = TRUE
  `, [conversationId, userId]);
  
  if ((convRows as any[]).length === 0) {
    return null;
  }
  
  const conversation = (convRows as any[])[0];
  const messages = await getConversationMessages(conversationId, userId);
  
  return {
    conversation,
    messages
  };
}

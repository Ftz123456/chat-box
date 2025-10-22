import pool from './database';
import { verifyToken } from './auth';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SaveMessageParams {
  userId: number;
  chatType: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  chat_type: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryItem {
  id: number;
  chat_type: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * 通用的消息保存服务类
 */
export class MessageService {
  /**
   * 从请求中提取用户ID
   */
  static async getUserIdFromRequest(req: Request): Promise<number | null> {
    try {
      const token = req.headers.get('cookie')
        ?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (!token) {
        return null;
      }

      const user = await verifyToken(token);
      return user?.id || null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }

  /**
   * 保存或更新对话到数据库
   */
  static async saveConversation(userId: number, chatType: string, messages: Message[]): Promise<number> {
    try {
      // 生成对话标题
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : `${chatType}对话`;

      // 检查是否已存在该用户的该类型对话
      const [existing] = await pool.execute(
        'SELECT id FROM conversations WHERE user_id = ? AND chat_type = ? ORDER BY updated_at DESC LIMIT 1',
        [userId, chatType]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        // 更新现有对话
        const conversationId = (existing as any[])[0].id;
        await pool.execute(
          'UPDATE conversations SET messages = ?, title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [JSON.stringify(messages), title, conversationId]
        );
        return conversationId;
      } else {
        // 创建新对话
        const [result] = await pool.execute(
          'INSERT INTO conversations (user_id, chat_type, title, messages) VALUES (?, ?, ?, ?)',
          [userId, chatType, title, JSON.stringify(messages)]
        );
        return (result as any).insertId;
      }
    } catch (error) {
      console.error('保存对话失败:', error);
      throw error;
    }
  }

  /**
   * 保存单条消息到数据库（兼容旧接口）
   */
  static async saveMessage(params: SaveMessageParams): Promise<number> {
    try {
      // 获取或创建当前对话
      const [existing] = await pool.execute(
        'SELECT id, messages FROM conversations WHERE user_id = ? AND chat_type = ? ORDER BY updated_at DESC LIMIT 1',
        [params.userId, params.chatType]
      );

      let messages: Message[] = [];
      let conversationId: number;

      if (Array.isArray(existing) && existing.length > 0) {
        // 更新现有对话
        const conversation = (existing as any[])[0];
        conversationId = conversation.id;
        // MySQL JSON字段已经自动解析为JavaScript对象，不需要JSON.parse
        messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      } else {
        // 创建新对话
        const [result] = await pool.execute(
          'INSERT INTO conversations (user_id, chat_type, title, messages) VALUES (?, ?, ?, ?)',
          [params.userId, params.chatType, '新对话', JSON.stringify([])]
        );
        conversationId = (result as any).insertId;
      }

      // 添加新消息
      messages.push({
        role: params.role,
        content: params.content
      });

      // 更新对话
      await this.saveConversation(params.userId, params.chatType, messages);
      
      return conversationId;
    } catch (error) {
      console.error('保存消息失败:', error);
      throw error;
    }
  }

  /**
   * 批量保存消息到数据库
   */
  static async saveMessages(userId: number, chatType: string, messages: Message[]): Promise<void> {
    try {
      // 过滤出用户和助手的消息，排除系统消息
      const validMessages = messages.filter(msg => 
        msg.role === 'user' || msg.role === 'assistant'
      );

      if (validMessages.length === 0) {
        return;
      }

      // 使用新的对话保存方法
      await this.saveConversation(userId, chatType, validMessages);
    } catch (error) {
      console.error('批量保存消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的历史记录列表
   */
  static async getUserHistory(userId: number): Promise<ChatHistoryItem[]> {
    try {
      const [history] = await pool.execute(`
        SELECT 
          id,
          chat_type,
          title,
          JSON_LENGTH(messages) as message_count,
          created_at,
          updated_at
        FROM conversations 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
        LIMIT 20
      `, [userId]);

      return (history as any[]).map(item => ({
        id: item.id,
        chat_type: item.chat_type,
        title: item.title,
        message_count: item.message_count,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('获取用户历史记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定历史记录的详细消息
   */
  static async getHistoryMessages(userId: number, historyId: number): Promise<ChatMessage[]> {
    try {
      // 获取对话记录
      const [conversation] = await pool.execute(
        'SELECT messages FROM conversations WHERE id = ? AND user_id = ?',
        [historyId, userId]
      );

      if ((conversation as any[]).length === 0) {
        throw new Error('历史记录不存在或无权限访问');
      }

      // MySQL JSON字段已经自动解析为JavaScript对象
      const messages = (conversation as any[])[0].messages;
      
      return messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at
      }));
    } catch (error) {
      console.error('获取历史记录消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取特定对话的完整信息
   */
  static async getConversation(userId: number, conversationId: number): Promise<Conversation | null> {
    try {
      const [conversation] = await pool.execute(
        'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
        [conversationId, userId]
      );

      if ((conversation as any[]).length === 0) {
        return null;
      }

      const conv = (conversation as any[])[0];
      return {
        id: conv.id,
        user_id: conv.user_id,
        chat_type: conv.chat_type,
        title: conv.title,
        messages: conv.messages, // MySQL JSON字段已经自动解析
        created_at: conv.created_at,
        updated_at: conv.updated_at
      };
    } catch (error) {
      console.error('获取对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计数据
   */
  static async getUserStats(userId: number): Promise<{
    totalConsultations: number;
    learningProgress: number;
    badges: number;
    membershipLevel: string;
  }> {
    try {
      // 获取总咨询次数（对话数量）
      const [consultationResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM conversations WHERE user_id = ?',
        [userId]
      );
      const totalConsultations = (consultationResult as any[])[0]?.total || 0;

      // 获取学习进度（基于消息数量）
      const [messageResult] = await pool.execute(
        'SELECT SUM(JSON_LENGTH(messages)) as total FROM conversations WHERE user_id = ?',
        [userId]
      );
      const messageCount = (messageResult as any[])[0]?.total || 0;
      const learningProgress = Math.min(Math.floor(messageCount / 10) * 10, 100);

      // 获取勋章数量（基于不同聊天类型的使用）
      const [badgeResult] = await pool.execute(
        'SELECT COUNT(DISTINCT chat_type) as badges FROM conversations WHERE user_id = ?',
        [userId]
      );
      const badges = (badgeResult as any[])[0]?.badges || 0;

      // 会员等级（基于总消息数）
      let membershipLevel = '普通';
      if (messageCount >= 100) {
        membershipLevel = 'VIP';
      } else if (messageCount >= 50) {
        membershipLevel = '高级';
      } else if (messageCount >= 20) {
        membershipLevel = '中级';
      }

      return {
        totalConsultations,
        learningProgress,
        badges,
        membershipLevel
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw error;
    }
  }

  /**
   * 根据聊天类型获取对应的页面路径
   */
  static getChatTypePath(chatType: string): string {
    const pathMap: { [key: string]: string } = {
      'digital': '/?type=digital',
      'comprehensive': '/?type=comprehensive',
      'bazi': '/bazi',
      'ziwei': '/ziwei',
      'marxist': '/marxist-analysis',
      'zhongyi': '/chat' // 中医聊天使用通用聊天页面
    };
    
    return pathMap[chatType] || '/';
  }

  /**
   * 根据页面路径获取聊天类型
   */
  static getChatTypeFromPath(pathname: string, searchParams?: URLSearchParams): string {
    if (pathname === '/') {
      const type = searchParams?.get('type');
      return type === 'comprehensive' ? 'comprehensive' : 'digital';
    }
    
    const pathMap: { [key: string]: string } = {
      '/bazi': 'bazi',
      '/ziwei': 'ziwei',
      '/marxist-analysis': 'marxist',
      '/chat': 'zhongyi'
    };
    
    return pathMap[pathname] || 'digital';
  }
}

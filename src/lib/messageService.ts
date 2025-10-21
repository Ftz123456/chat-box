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

export interface ChatHistoryItem {
  id: number;
  chat_type: string;
  first_message: string;
  last_message: string;
  message_count: number;
  latest_id: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
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

      const decoded = verifyToken(token);
      return decoded?.userId || null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }

  /**
   * 保存单条消息到数据库
   */
  static async saveMessage(params: SaveMessageParams): Promise<number> {
    try {
      const [result] = await pool.execute(
        'INSERT INTO chat_messages (user_id, chat_type, role, content) VALUES (?, ?, ?, ?)',
        [params.userId, params.chatType, params.role, params.content]
      );
      
      return (result as any).insertId;
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

      // 准备批量插入数据
      const values = validMessages.map(msg => [
        userId,
        chatType,
        msg.role,
        msg.content
      ]);

      // 批量插入
      const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();

      await pool.execute(
        `INSERT INTO chat_messages (user_id, chat_type, role, content) VALUES ${placeholders}`,
        flatValues
      );
    } catch (error) {
      console.error('批量保存消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的历史记录列表（按聊天类型分组）
   */
  static async getUserHistory(userId: number): Promise<ChatHistoryItem[]> {
    try {
      const [history] = await pool.execute(`
        SELECT 
          chat_type,
          MIN(created_at) as first_message,
          MAX(created_at) as last_message,
          COUNT(*) as message_count,
          SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT id ORDER BY created_at DESC), ',', 1) as latest_id
        FROM chat_messages 
        WHERE user_id = ? 
        GROUP BY chat_type 
        ORDER BY last_message DESC
        LIMIT 20
      `, [userId]);

      return (history as any[]).map(item => ({
        id: parseInt(item.latest_id),
        chat_type: item.chat_type,
        first_message: item.first_message,
        last_message: item.last_message,
        message_count: item.message_count,
        latest_id: parseInt(item.latest_id),
        created_at: item.last_message
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
      // 首先获取该历史记录的基本信息
      const [historyInfo] = await pool.execute(
        'SELECT chat_type FROM chat_messages WHERE id = ? AND user_id = ?',
        [historyId, userId]
      );

      if ((historyInfo as any[]).length === 0) {
        throw new Error('历史记录不存在或无权限访问');
      }

      const chatType = (historyInfo as any[])[0].chat_type;

      // 获取该聊天类型的所有消息
      const [messages] = await pool.execute(`
        SELECT id, role, content, created_at
        FROM chat_messages 
        WHERE user_id = ? AND chat_type = ?
        ORDER BY created_at ASC
      `, [userId, chatType]);

      return (messages as any[]).map(msg => ({
        id: msg.id,
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
   * 获取用户统计数据
   */
  static async getUserStats(userId: number): Promise<{
    totalConsultations: number;
    learningProgress: number;
    badges: number;
    membershipLevel: string;
  }> {
    try {
      // 获取总咨询次数
      const [consultationResult] = await pool.execute(
        'SELECT COUNT(DISTINCT chat_type) as total FROM chat_messages WHERE user_id = ?',
        [userId]
      );
      const totalConsultations = (consultationResult as any[])[0]?.total || 0;

      // 获取学习进度（基于消息数量）
      const [messageResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM chat_messages WHERE user_id = ?',
        [userId]
      );
      const messageCount = (messageResult as any[])[0]?.total || 0;
      const learningProgress = Math.min(Math.floor(messageCount / 10) * 10, 100);

      // 获取勋章数量（基于不同聊天类型的使用）
      const [badgeResult] = await pool.execute(
        'SELECT COUNT(DISTINCT chat_type) as badges FROM chat_messages WHERE user_id = ?',
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

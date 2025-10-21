import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: '登录已过期' },
        { status: 401 }
      );
    }

    // 获取用户历史记录，按聊天类型分组，显示最新的对话
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
    `, [user.id]);

    // 获取每个聊天类型的最新消息内容
    const historyWithContent = await Promise.all(
      (history as any[]).map(async (item) => {
        const [latestMessage] = await pool.execute(
          'SELECT content FROM chat_messages WHERE id = ?',
          [item.latest_id]
        );
        
        return {
          id: item.latest_id,
          chat_type: item.chat_type,
          created_at: item.last_message,
          message_count: item.message_count,
          preview: (latestMessage as any[])[0]?.content?.substring(0, 50) + '...' || ''
        };
      })
    );

    return NextResponse.json(historyWithContent);

  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

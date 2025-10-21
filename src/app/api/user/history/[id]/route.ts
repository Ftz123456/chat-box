import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const historyId = params.id;

    // 获取特定历史记录的所有消息
    const [messages] = await pool.execute(`
      SELECT 
        id,
        chat_type,
        role,
        content,
        created_at
      FROM chat_messages 
      WHERE user_id = ? AND id = ?
      ORDER BY created_at ASC
    `, [user.id, historyId]);

    if ((messages as any[]).length === 0) {
      return NextResponse.json(
        { error: '历史记录不存在' },
        { status: 404 }
      );
    }

    // 获取该聊天类型的所有相关消息
    const firstMessage = (messages as any[])[0];
    const [allMessages] = await pool.execute(`
      SELECT 
        id,
        role,
        content,
        created_at
      FROM chat_messages 
      WHERE user_id = ? AND chat_type = ? AND DATE(created_at) = DATE(?)
      ORDER BY created_at ASC
    `, [user.id, firstMessage.chat_type, firstMessage.created_at]);

    return NextResponse.json({
      chat_type: firstMessage.chat_type,
      messages: allMessages,
      date: firstMessage.created_at
    });

  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    return NextResponse.json(
      { error: '获取历史记录详情失败' },
      { status: 500 }
    );
  }
}

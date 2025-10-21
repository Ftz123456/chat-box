import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserConversations } from '@/lib/messageService';

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

    // 获取用户历史记录
    const conversations = await getUserConversations(user.id, 20);

    // 格式化历史记录数据
    const historyWithContent = conversations.map(item => ({
      id: item.id,
      chat_type: item.chat_type,
      title: item.title,
      created_at: item.last_message_at,
      message_count: item.message_count,
      preview: item.first_message?.substring(0, 50) + '...' || ''
    }));

    return NextResponse.json(historyWithContent);

  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

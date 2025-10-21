import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getConversationDetails } from '@/lib/messageService';

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

    const conversationId = parseInt(params.id);

    // 获取对话详情
    const conversationData = await getConversationDetails(conversationId, user.id);

    if (!conversationData) {
      return NextResponse.json(
        { error: '历史记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: conversationData.conversation,
      messages: conversationData.messages
    });

  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    return NextResponse.json(
      { error: '获取历史记录详情失败' },
      { status: 500 }
    );
  }
}

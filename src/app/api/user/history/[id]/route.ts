import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: '无效的对话ID' },
        { status: 400 }
      );
    }

    // 获取用户ID
    const userId = await MessageService.getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取对话详情
    const conversation = await MessageService.getConversation(userId, conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在或无权限访问' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      chat_type: conversation.chat_type,
      title: conversation.title,
      messages: conversation.messages,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    });

  } catch (error: any) {
    console.error('获取对话详情失败:', error);
    return NextResponse.json(
      { error: '获取对话详情失败' },
      { status: 500 }
    );
  }
}
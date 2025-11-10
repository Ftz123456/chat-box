import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 获取用户ID
    const userId = await MessageService.getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    let conversation;
    
    // 首先尝试作为session_id（UUID字符串）查询
    try {
      conversation = await MessageService.getConversationBySessionId(userId, id);
    } catch (e) {
      console.error('通过session_id查询失败:', e);
      // 如果失败，尝试作为数字ID查询（兼容旧接口）
      const conversationId = parseInt(id);
      if (!isNaN(conversationId)) {
        try {
          conversation = await MessageService.getConversation(userId, conversationId);
        } catch (e2) {
          console.error('通过ID查询失败:', e2);
        }
      }
    }
    
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在或无权限访问' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: conversation.id,
      session_id: conversation.session_id,
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
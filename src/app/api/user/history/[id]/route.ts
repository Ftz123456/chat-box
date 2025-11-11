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
    
    // 首先尝试作为数字ID查询（兼容旧接口）
    const conversationId = parseInt(id);
    if (!isNaN(conversationId) && conversationId.toString() === id) {
      // 如果id是纯数字，直接作为ID查询
      try {
        conversation = await MessageService.getConversation(userId, conversationId);
      } catch (e) {
        console.error('通过ID查询失败:', e);
      }
    }
    
    // 如果ID查询失败或id不是纯数字，尝试作为session_id查询
    if (!conversation) {
      try {
        // 检查是否是有效的UUID格式（包含连字符）或非空字符串
        if (id && id.trim().length > 0 && !id.match(/^\d+$/)) {
          conversation = await MessageService.getConversationBySessionId(userId, id);
        }
      } catch (e) {
        console.error('通过session_id查询失败:', e);
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

export async function DELETE(
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

    // 首先尝试作为数字ID删除（兼容旧接口）
    const conversationId = parseInt(id);
    let deleted = false;
    
    if (!isNaN(conversationId) && conversationId.toString() === id) {
      // 如果id是纯数字，直接作为ID删除
      try {
        deleted = await MessageService.deleteConversation(userId, conversationId);
      } catch (e) {
        console.error('通过ID删除失败:', e);
      }
    }
    
    // 如果ID删除失败或id不是纯数字，尝试作为session_id删除
    if (!deleted) {
      try {
        // 检查是否是有效的非空字符串且不是纯数字
        if (id && id.trim().length > 0 && !id.match(/^\d+$/)) {
          deleted = await MessageService.deleteConversation(userId, id);
        }
      } catch (e) {
        console.error('通过session_id删除失败:', e);
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: '对话不存在或无权限访问' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '对话已删除'
    });

  } catch (error: any) {
    console.error('删除对话失败:', error);
    return NextResponse.json(
      { error: '删除对话失败' },
      { status: 500 }
    );
  }
}

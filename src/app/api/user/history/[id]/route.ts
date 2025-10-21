import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取用户ID
    const userId = await MessageService.getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: '登录已过期' },
        { status: 401 }
      );
    }

    const historyId = parseInt(params.id);
    if (isNaN(historyId)) {
      return NextResponse.json(
        { error: '无效的历史记录ID' },
        { status: 400 }
      );
    }

    // 获取历史记录详细消息
    const messages = await MessageService.getHistoryMessages(userId, historyId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('获取历史记录详情失败:', error);
    return NextResponse.json(
      { error: '获取历史记录详情失败' },
      { status: 500 }
    );
  }
}
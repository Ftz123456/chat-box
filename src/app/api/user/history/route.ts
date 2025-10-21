import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

export async function GET(req: NextRequest) {
  try {
    // 获取用户ID
    const userId = await MessageService.getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: '登录已过期' },
        { status: 401 }
      );
    }

    // 获取用户历史记录
    const history = await MessageService.getUserHistory(userId);

    return NextResponse.json(history);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

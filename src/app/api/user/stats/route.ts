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

    // 获取用户统计数据
    const stats = await MessageService.getUserStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}

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

    // 获取用户统计数据
    const [consultationCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = "user"',
      [user.id]
    );

    const [messageCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?',
      [user.id]
    );

    const totalConsultations = (consultationCount as any[])[0].count;
    const totalMessages = (messageCount as any[])[0].count;
    
    // 计算学习进度（基于消息数量）
    const learningProgress = Math.min(Math.floor((totalMessages / 10) * 100), 100);
    
    // 计算勋章数量（基于不同聊天类型的使用）
    const [badgeCount] = await pool.execute(
      'SELECT COUNT(DISTINCT chat_type) as count FROM chat_messages WHERE user_id = ?',
      [user.id]
    );
    
    const badges = (badgeCount as any[])[0].count;
    
    // 根据咨询次数确定会员等级
    let membershipLevel = '普通';
    if (totalConsultations >= 50) {
      membershipLevel = '钻石';
    } else if (totalConsultations >= 20) {
      membershipLevel = '黄金';
    } else if (totalConsultations >= 10) {
      membershipLevel = '白银';
    } else if (totalConsultations >= 5) {
      membershipLevel = '青铜';
    }

    return NextResponse.json({
      totalConsultations,
      learningProgress,
      badges,
      membershipLevel,
      totalMessages
    });

  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}

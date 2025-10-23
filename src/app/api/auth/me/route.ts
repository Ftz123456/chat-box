import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('Auth token from cookie:', token ? 'exists' : 'missing');
    
    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    
    console.log('User verification result:', user ? 'success' : 'failed');
    
    if (!user) {
      console.log('Token verification failed or user not found');
      return NextResponse.json(
        { error: '登录已过期，请重新登录' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

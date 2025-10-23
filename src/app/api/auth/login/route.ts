import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // 验证输入
    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码都是必填项' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确，请输入有效的11位手机号' },
        { status: 400 }
      );
    }

    // 登录用户
    const { user, token } = await loginUser({ phone, password });

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });

    // 设置cookie - 简化配置以确保兼容性
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps = process.env.NEXT_PUBLIC_HTTPS === 'true';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction && isHttps, // 只有在生产环境且明确启用HTTPS时才使用secure
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined // 让浏览器自动处理域名
    };
    
    console.log('Environment:', { isProduction, isHttps, NODE_ENV: process.env.NODE_ENV });
    console.log('Setting cookie with options:', cookieOptions);
    response.cookies.set('auth-token', token, cookieOptions);

    return response;

  } catch (error: any) {
    console.error('登录错误:', error);
    
    if (error.message === '用户不存在或已被禁用' || error.message === '密码错误') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

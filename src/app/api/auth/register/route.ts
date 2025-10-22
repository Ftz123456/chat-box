import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, phone, password } = body;

    // 验证输入
    if (!username || !phone || !password) {
      return NextResponse.json(
        { error: '用户名、手机号和密码都是必填项' },
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

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度应在2-20个字符之间' },
        { status: 400 }
      );
    }

    // 注册用户
    const user = await registerUser({ username, phone, password });

    return NextResponse.json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });

  } catch (error: any) {
    console.error('注册错误:', error);
    
    if (error.message === '用户名或手机号已存在') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}

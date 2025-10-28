import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-2024';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  username: string;
  phone: string;
  avatar?: string;
  created_at: Date;
  last_login?: Date;
}

export interface RegisterData {
  username: string;
  phone: string;
  password: string;
  birthday?: string | null; // ISO string optional
}

export interface LoginData {
  phone: string;
  password: string;
}

// 注册用户
export async function registerUser(data: RegisterData): Promise<User> {
  const { username, phone, password, birthday } = data;
  
  // 检查用户是否已存在
  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE phone = ? OR username = ?',
    [phone, username]
  );
  
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    throw new Error('用户名或手机号已存在');
  }
  
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // 插入新用户
  const birthdayValue = birthday ? new Date(birthday) : null;
  
  const [result] = await pool.execute(
    'INSERT INTO users (username, phone, password, birthday) VALUES (?, ?, ?, ?)',
    [username, phone, hashedPassword, birthdayValue]
  );
  
  const insertResult = result as any;
  const userId = insertResult.insertId;
  
  // 返回用户信息（不包含密码）
  const [users] = await pool.execute(
    'SELECT id, username, phone, avatar, created_at, last_login, birthday FROM users WHERE id = ?',
    [userId]
  );
  
  return (users as User[])[0];
}

// 用户登录
export async function loginUser(data: LoginData): Promise<{ user: User; token: string }> {
  const { phone, password } = data;
  
  // 查找用户
  const [users] = await pool.execute(
    'SELECT id, username, phone, password, avatar, created_at, last_login FROM users WHERE phone = ? AND is_active = TRUE',
    [phone]
  );
  
  const userList = users as any[];
  if (userList.length === 0) {
    throw new Error('用户不存在或已被禁用');
  }
  
  const user = userList[0];
  
  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('密码错误');
  }
  
  // 更新最后登录时间
  await pool.execute(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
    [user.id]
  );
  
  // 生成JWT token
  const token = jwt.sign(
    { userId: user.id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // 存储会话到数据库
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期
  
  await pool.execute(
    'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt]
  );
  
  // 返回用户信息（不包含密码）和token
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token
  };
}

// 验证JWT token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 检查会话是否存在于数据库中
    const [sessions] = await pool.execute(
      'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
      [token]
    );
    
    if (Array.isArray(sessions) && sessions.length === 0) {
      return null;
    }
    
    // 获取用户信息
    const [users] = await pool.execute(
      'SELECT id, username, phone, avatar, created_at, last_login FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );
    
    const userList = users as User[];
    return userList.length > 0 ? userList[0] : null;
  } catch (error) {
    return null;
  }
}

// 登出用户
export async function logoutUser(token: string): Promise<void> {
  await pool.execute(
    'DELETE FROM user_sessions WHERE session_token = ?',
    [token]
  );
}

// 获取用户信息
export async function getUserById(userId: number): Promise<User | null> {
  const [users] = await pool.execute(
    'SELECT id, username, phone, avatar, created_at, last_login FROM users WHERE id = ? AND is_active = TRUE',
    [userId]
  );
  
  const userList = users as User[];
  return userList.length > 0 ? userList[0] : null;
}

// 更新用户信息
export async function updateUser(userId: number, data: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User | null> {
  const fields = [];
  const values = [];
  
  if (data.username) {
    fields.push('username = ?');
    values.push(data.username);
  }
  
  if (data.avatar) {
    fields.push('avatar = ?');
    values.push(data.avatar);
  }
  
  if (fields.length === 0) {
    return getUserById(userId);
  }
  
  values.push(userId);
  
  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  
  return getUserById(userId);
}

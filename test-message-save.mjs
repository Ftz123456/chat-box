// 测试消息保存功能
import fetch from 'node-fetch';

async function testMessageSave() {
  console.log('🧪 测试消息保存功能...\n');

  try {
    // 1. 先注册一个测试用户
    console.log('1. 注册测试用户...');
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (registerResponse.status === 201) {
      console.log('✅ 用户注册成功');
    } else if (registerResponse.status === 409) {
      console.log('ℹ️ 用户已存在，继续测试');
    } else {
      console.log('❌ 用户注册失败，状态码:', registerResponse.status);
      const errorText = await registerResponse.text();
      console.log('错误详情:', errorText);
      return;
    }

    // 2. 登录获取token
    console.log('\n2. 用户登录...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ 登录失败，状态码:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('错误详情:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginResponse.headers.get('set-cookie')?.split(';')[0]?.split('=')[1];
    console.log('✅ 登录成功，token:', authToken ? '已设置' : '未获取到');

    // 3. 测试聊天API并保存消息
    console.log('\n3. 测试聊天API消息保存...');
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${authToken}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: '你好，我想测试消息保存功能' }
        ],
        type: 'digital'
      })
    });

    if (chatResponse.status === 200) {
      console.log('✅ 聊天API调用成功');
      
      // 读取流式响应
      const reader = chatResponse.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('✅ 流式响应完成');
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                responseText += parsed.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      console.log('响应内容长度:', responseText.length);
    } else {
      console.log('❌ 聊天API调用失败，状态码:', chatResponse.status);
      const errorText = await chatResponse.text();
      console.log('错误详情:', errorText);
    }

    // 4. 检查用户统计
    console.log('\n4. 检查用户统计...');
    const statsResponse = await fetch('http://localhost:3000/api/user/stats', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${authToken}`
      }
    });

    if (statsResponse.status === 200) {
      const stats = await statsResponse.json();
      console.log('✅ 用户统计:', stats);
    } else {
      console.log('❌ 获取用户统计失败，状态码:', statsResponse.status);
    }

    // 5. 检查历史记录
    console.log('\n5. 检查历史记录...');
    const historyResponse = await fetch('http://localhost:3000/api/user/history', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${authToken}`
      }
    });

    if (historyResponse.status === 200) {
      const history = await historyResponse.json();
      console.log('✅ 历史记录:', history);
    } else {
      console.log('❌ 获取历史记录失败，状态码:', historyResponse.status);
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

testMessageSave();

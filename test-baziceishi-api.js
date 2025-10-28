/**
 * 测试 baziceishi API 功能
 */

// 使用 Node.js 18+ 内置的原生 fetch

// 配置
const BASE_URL = 'http://localhost:3000'; // 本地开发服务器
const API_ENDPOINT = `${BASE_URL}/api/baziceishi`;

// 测试消息
const testMessages = [
  {
    role: 'user',
    content: '你好，请简单介绍一下八字测事。'
  }
];

/**
 * 测试 API 请求
 */
async function testBaziCeishiAPI() {
  console.log('🚀 开始测试 baziceishi API...\n');
  console.log('请求数据:', JSON.stringify({ messages: testMessages }, null, 2));
  console.log('\n📡 发送请求到:', API_ENDPOINT);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: testMessages
      })
    });

    console.log('✅ 响应状态:', response.status, response.statusText);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    console.log('\n📨 开始接收流式数据...\n');
    console.log('--- 流式响应内容 ---');

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n--- 流式响应结束 ---\n');
        break;
      }

      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      
      // 输出每个chunk
      process.stdout.write(chunk);
    }

    console.log('\n📊 统计信息:');
    console.log(`- 总chunk数: ${chunkCount}`);
    console.log(`- 总响应长度: ${fullResponse.length} 字符`);
    console.log(`- 响应内容预览: ${fullResponse.substring(0, 200)}...`);

    console.log('\n✅ API 测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保开发服务器正在运行 (npm run dev)');
    }
    
    console.error('\n完整错误信息:', error);
  }
}

/**
 * 测试错误情况 - 缺少 messages 参数
 */
async function testMissingMessages() {
  console.log('\n\n🧪 测试错误情况: 缺少 messages 参数...\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应数据:', data);

    if (response.status === 400 && data.error === 'Messages are required') {
      console.log('✅ 错误处理正常');
    } else {
      console.log('❌ 错误处理异常');
    }

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

/**
 * 测试错误情况 - messages 不是数组
 */
async function testInvalidMessages() {
  console.log('\n\n🧪 测试错误情况: messages 不是数组...\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: 'not an array'
      })
    });

    const data = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应数据:', data);

    if (response.status === 400 && data.error === 'Messages are required') {
      console.log('✅ 错误处理正常');
    } else {
      console.log('❌ 错误处理异常');
    }

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('       baziceishi API 功能测试');
  console.log('═══════════════════════════════════════════════════\n');

  // 测试1: 正常请求
  await testBaziCeishiAPI();

  // 测试2: 缺少 messages 参数
  await testMissingMessages();

  // 测试3: 无效的 messages 参数
  await testInvalidMessages();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('                    测试完成');
  console.log('═══════════════════════════════════════════════════');
}

// 运行测试
runAllTests().catch(console.error);


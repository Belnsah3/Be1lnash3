const axios = require('axios');

async function testMockResponse() {
    console.log('\n🧪 Тестирование mock-ответов LumeAI\n');
    
    // Получаем реальный API ключ из БД
    const db = require('./src/database/db');
    const keys = db.prepare('SELECT key FROM api_keys WHERE is_active = 1 LIMIT 1').all();
    
    if (keys.length === 0) {
        console.log('❌ Нет активных API ключей. Создай ключ в панели.');
        return;
    }
    
    const apiKey = keys[0].key;
    console.log(`✅ Используем API ключ: ${apiKey.substring(0, 20)}...`);
    
    const tests = [
        { message: 'Привет!', expected: 'Привет! Я - LumeAI' },
        { message: 'Как дела?', expected: 'У меня все отлично!' },
        { message: 'Расскажи про себя', expected: 'Я получил ваш запрос' }
    ];
    
    for (const test of tests) {
        console.log(`\n📤 Отправка: "${test.message}"`);
        
        try {
            const response = await axios.post('https://lumeai.ru/v1/responses', {
                model: 'gpt-4',
                messages: [
                    { role: 'user', content: test.message }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content;
                console.log(`📥 Ответ: "${content}"`);
                
                if (content.includes(test.expected)) {
                    console.log(`✅ Тест пройден!`);
                } else {
                    console.log(`⚠️  Ожидалось: "${test.expected}"`);
                }
            } else {
                console.log(`❌ Некорректный формат ответа:`, response.data);
            }
        } catch (error) {
            console.log(`❌ Ошибка:`, error.response?.data || error.message);
        }
    }
    
    console.log('\n✨ Тестирование завершено!\n');
}

testMockResponse();

// 豆包 AI 服务
// 使用字节跳动豆包 API 进行对话

const DOUBAO_API_KEY = import.meta.env.VITE_DOUBAO_API_KEY || '0f38335f-e017-4db3-b945-39c0b6903e59';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';

// 豆包模型 ID
const MODEL_ID = 'doubao-seed-1-8-251228';

// 系统提示词
const SYSTEM_PROMPT = `你是一位专业、友善的 AI 宠物顾问，名叫"小豆"。你的职责是：
1. 为用户提供科学、专业的宠物健康咨询
2. 解答宠物饲养、训练、营养等方面的问题
3. 当用户描述宠物症状时，给出初步建议，但总是建议严重情况就医
4. 语气亲切温和，使用表情符号增加亲和力
5. 回答要简洁明了，一般不超过200字

记住：你不是真正的兽医，对于严重的健康问题，要建议用户带宠物就医。`;

// 对话历史
let conversationHistory: Array<{ role: string; content: any }> = [];

// 重置对话历史
export const resetConversation = () => {
    conversationHistory = [];
};

// 递归提取文本内容
const extractText = (data: any): string => {
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) {
        return data.map(extractText).join('');
    }
    if (data && typeof data === 'object') {
        // 检查各种可能的文本字段
        if (data.text) return data.text;
        if (data.content) return extractText(data.content);
        if (data.message) return extractText(data.message);
        if (data.output) return extractText(data.output);
        if (data.choices) return extractText(data.choices);
    }
    return '';
};

// 发送消息到豆包 API
export const sendMessageToDoubao = async (userMessage: string, imageUrl?: string): Promise<string> => {
    // 构建用户消息内容
    const userContent: any[] = [];

    if (imageUrl) {
        userContent.push({
            type: 'input_image',
            image_url: imageUrl
        });
    }

    userContent.push({
        type: 'input_text',
        text: userMessage || '请分析这张宠物图片'
    });

    // 添加用户消息到历史
    conversationHistory.push({
        role: 'user',
        content: userContent
    });

    // 构建请求输入
    const input = [
        {
            role: 'system',
            content: [{ type: 'input_text', text: SYSTEM_PROMPT }]
        },
        ...conversationHistory.slice(-10)
    ];

    try {
        console.log('发送豆包请求:', JSON.stringify({ model: MODEL_ID, input }, null, 2));

        const response = await fetch(DOUBAO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DOUBAO_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ID,
                input: input
            })
        });

        const responseText = await response.text();
        console.log('豆包响应状态:', response.status);
        console.log('豆包响应内容:', responseText);

        if (!response.ok) {
            console.error('豆包 API 错误:', response.status, responseText);
            return `API 错误 (${response.status}): ${responseText.slice(0, 100)}`;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON 解析失败:', e);
            return '响应解析失败，请重试。';
        }

        // 尝试多种方式提取文本
        let assistantMessage = extractText(data);

        if (!assistantMessage) {
            console.log('无法提取文本，完整响应:', JSON.stringify(data, null, 2));
            assistantMessage = '抱歉，我暂时无法理解您的问题。请换个方式问问？';
        }

        // 添加助手回复到历史
        conversationHistory.push({
            role: 'assistant',
            content: [{ type: 'input_text', text: assistantMessage }]
        });

        return assistantMessage;
    } catch (error) {
        console.error('豆包 API 调用失败:', error);
        return `网络错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
};

// 流式响应（模拟逐字输出效果）
export const sendMessageWithStreaming = async (
    userMessage: string,
    onChunk: (text: string) => void,
    imageBase64?: string
): Promise<void> => {
    // 如果有 base64 图片，转换为 data URL
    let imageUrl: string | undefined;
    if (imageBase64) {
        imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    }

    const fullResponse = await sendMessageToDoubao(userMessage, imageUrl);

    // 模拟流式输出
    let currentText = '';
    for (let i = 0; i < fullResponse.length; i++) {
        currentText += fullResponse[i];
        onChunk(currentText);
        // 根据字符类型调整延迟
        const delay = /[，。！？、\n]/.test(fullResponse[i]) ? 60 : 10;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
};

// 快速问答（不保存历史）
export const quickAsk = async (question: string): Promise<string> => {
    const input = [
        {
            role: 'system',
            content: [{ type: 'input_text', text: SYSTEM_PROMPT }]
        },
        {
            role: 'user',
            content: [{ type: 'input_text', text: question }]
        }
    ];

    try {
        const response = await fetch(DOUBAO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DOUBAO_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_ID,
                input: input
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return `API 错误: ${errorText.slice(0, 100)}`;
        }

        const data = await response.json();
        return extractText(data) || '抱歉，我暂时无法回答。';
    } catch (error) {
        console.error('快速问答失败:', error);
        return '抱歉，网络连接出现问题。';
    }
};

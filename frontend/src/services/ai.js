// AI Service for direct browser API calls
import { useProjectStore } from '../stores/project'

export class AIService {
  constructor() {
    this.store = useProjectStore()
  }

  get settings() {
    return this.store.settings
  }

  async generateText(prompt, options = {}) {
    const { aiProvider } = this.settings
    
    if (aiProvider === 'openai') {
      return this.callOpenAI(prompt, options)
    } else if (aiProvider === 'claude') {
      return this.callClaude(prompt, options)
    } else {
      throw new Error('Unknown AI provider')
    }
  }

  async callOpenAI(prompt, options = {}) {
    const { openaiKey, openaiModel } = this.settings
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful writing assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callClaude(prompt, options = {}) {
    const { claudeKey, claudeModel } = this.settings
    
    if (!claudeKey) {
      throw new Error('Claude API key not configured')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: options.maxTokens ?? 2000,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: options.systemPrompt || 'You are a helpful writing assistant.'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    return data.content[0].text
  }

  // Story generation helpers
  async generatePlotOutline(title, genre, summary) {
    const prompt = `请为小说《${title}》生成一个详细的情节大纲。

类型：${genre}
简介：${summary}

请提供：
1. 三幕式结构概述
2. 主要情节点（至少10个）
3. 每章简要内容
4. 建议的伏笔设置点

请用中文回答。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的小说编剧和写作顾问，擅长构建情节结构。',
      maxTokens: 4000
    })
  }

  async generateCharacter(name, role, description) {
    const prompt = `请为角色"${name}"创建详细的人物设定。

角色定位：${role}
基础描述：${description}

请提供：
1. 外貌特征
2. 性格特点（详细）
3. 背景故事
4. 动机和目标
5. 内心冲突
6. 成长弧线
7. 与其他角色的关系建议
8. 标志性台词或习惯

请用中文回答。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的人物设定师，擅长创造立体、真实的角色。',
      maxTokens: 3000
    })
  }

  async continueStory(context, style = '') {
    const prompt = `请根据以下内容续写故事：

前文：
${context}

${style ? `写作风格要求：${style}` : ''}

请自然地续写，保持情节连贯和人物一致性。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业小说家，擅长根据前文风格续写故事。',
      maxTokens: 3000
    })
  }

  async polishText(text, type = 'general') {
    const typePrompts = {
      general: '请润色以下文本，使其更加流畅自然：',
      vivid: '请润色以下文本，增加更多细节和感官描写，使其更加生动：',
      concise: '请精简以下文本，去除冗余，保留核心信息：',
      dialogue: '请优化以下对话，使其更加自然、符合角色性格：'
    }

    const prompt = `${typePrompts[type] || typePrompts.general}

${text}`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的文字编辑，擅长提升文本质量。',
      maxTokens: 3000
    })
  }

  async analyzeForeshadowing(chapters, foreshadowings) {
    const prompt = `请分析以下章节内容与伏笔设置的关联性：

伏笔列表：
${foreshadowings.map(f => `- ${f.name}: ${f.description} (状态: ${f.status})`).join('\n')}

章节内容摘要：
${chapters.map(c => `- ${c.title}: ${c.summary || '无摘要'}`).join('\n')}

请分析：
1. 哪些伏笔已经回收
2. 哪些伏笔需要加强
3. 建议新增的伏笔
4. 伏笔之间的关联建议

请用中文回答。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的剧本分析师，擅长分析伏笔设置和情节结构。',
      maxTokens: 3000
    })
  }

  async generateBeatOutline(chapterTitle, chapterSummary, characters) {
    const prompt = `请为章节"${chapterTitle}"生成节拍表。

章节概要：${chapterSummary}

出场角色：${characters.join(', ')}

请按照以下结构生成节拍：
1. 开场画面
2. 主题呈现
3. 铺垫
4. 催化剂
5. 争论
6. 进入第二幕
7. B故事
8. 游戏
9. 中点
10. 坏人逼近
11. 一无所有
12. 灵魂黑夜
13. 进入第三幕
14. 结局
15. 终场画面

每个节拍包含：场景描述、情感价值、页数估计

请用中文回答。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的剧本顾问，精通节拍表结构。',
      maxTokens: 4000
    })
  }

  async summarizeChapter(content) {
    const prompt = `请为以下内容生成摘要：

${content.substring(0, 3000)}

请提供：
1. 一句话摘要
2. 关键事件
3. 出场角色
4. 情感基调

请用中文回答。`

    return this.generateText(prompt, {
      systemPrompt: '你是一位专业的内容摘要师。',
      maxTokens: 1500
    })
  }
}

export const aiService = new AIService()

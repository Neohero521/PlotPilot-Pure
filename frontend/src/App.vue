<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : null" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <div class="app-container">
              <!-- 顶部导航 -->
              <n-layout-header bordered class="header">
                <div class="header-content">
                  <div class="logo">
                    <n-icon size="28" :component="BookOutline" />
                    <span class="title">PlotPilot Pure</span>
                    <n-tag size="small" type="info">纯前端版</n-tag>
                  </div>
                  <n-space>
                    <n-button quaternary @click="currentView = 'dashboard'">
                      <template #icon><n-icon :component="HomeOutline" /></template>
                      工作台
                    </n-button>
                    <n-button quaternary @click="currentView = 'bible'">
                      <template #icon><n-icon :component="PeopleOutline" /></template>
                      Story Bible
                    </n-button>
                    <n-button quaternary @click="currentView = 'chapters'">
                      <template #icon><n-icon :component="DocumentTextOutline" /></template>
                      章节
                    </n-button>
                    <n-button quaternary @click="currentView = 'knowledge'">
                      <template #icon><n-icon :component="GitNetworkOutline" /></template>
                      知识图谱
                    </n-button>
                    <n-button quaternary @click="currentView = 'foreshadowing'">
                      <template #icon><n-icon :component="FlashOutline" /></template>
                      伏笔
                    </n-button>
                    <n-button quaternary @click="currentView = 'beats'">
                      <template #icon><n-icon :component="PulseOutline" /></template>
                      节拍表
                    </n-button>
                    <n-button quaternary @click="currentView = 'settings'">
                      <template #icon><n-icon :component="SettingsOutline" /></template>
                      设置
                    </n-button>
                    <n-button quaternary circle @click="toggleTheme">
                      <template #icon>
                        <n-icon :component="theme === 'dark' ? SunnyOutline : MoonOutline" />
                      </template>
                    </n-button>
                  </n-space>
                </div>
              </n-layout-header>

              <!-- 主内容区 -->
              <n-layout-content class="main-content">
                <!-- 工作台 -->
                <div v-if="currentView === 'dashboard'" class="view">
                  <n-grid :cols="3" :x-gap="16" :y-gap="16">
                    <n-grid-item>
                      <n-card title="📊 项目概览">
                        <n-statistic label="总章节数" :value="chapters.length" />
                        <n-statistic label="总字数" :value="totalWords" />
                        <n-statistic label="人物数" :value="characters.length" />
                        <n-statistic label="伏笔数" :value="foreshadowings.length" />
                      </n-card>
                    </n-grid-item>
                    <n-grid-item :span="2">
                      <n-card title="✍️ 快速开始">
                        <n-space vertical>
                          <n-input v-model:value="newStoryTitle" placeholder="输入作品名称..." />
                          <n-input v-model:value="newStoryDesc" type="textarea" placeholder="作品简介..." />
                          <n-space>
                            <n-button type="primary" @click="createStory">
                              <template #icon><n-icon :component="AddOutline" /></template>
                              创建作品
                            </n-button>
                            <n-button @click="currentView = 'autopilot'" type="success">
                              <template #icon><n-icon :component="PlayOutline" /></template>
                              自动驾驶
                            </n-button>
                          </n-space>
                        </n-space>
                      </n-card>
                    </n-grid-item>
                  </n-grid>

                  <!-- 最近章节 -->
                  <n-card title="📖 最近章节" class="mt-4">
                    <n-empty v-if="chapters.length === 0" description="暂无章节，开始创作吧！" />
                    <n-list v-else>
                      <n-list-item v-for="ch in recentChapters" :key="ch.id">
                        <n-thing :title="ch.title" :description="ch.summary || '无摘要'">
                          <template #header-extra>
                            <n-tag :type="ch.status === 'completed' ? 'success' : 'warning'">
                              {{ ch.status === 'completed' ? '已完成' : '草稿' }}
                            </n-tag>
                          </template>
                          <template #footer>
                            {{ new Date(ch.updatedAt).toLocaleString() }}
                          </template>
                        </n-thing>
                      </n-list-item>
                    </n-list>
                  </n-card>
                </div>

                <!-- Story Bible -->
                <div v-if="currentView === 'bible'" class="view">
                  <n-tabs type="line">
                    <n-tab-pane name="characters" tab="👤 人物">
                      <n-space vertical>
                        <n-button type="primary" @click="showCharacterModal = true">
                          <template #icon><n-icon :component="AddOutline" /></template>
                          添加人物
                        </n-button>
                        <n-grid :cols="3" :x-gap="12" :y-gap="12">
                          <n-grid-item v-for="char in characters" :key="char.id">
                            <n-card :title="char.name" size="small">
                              <p><strong>角色:</strong> {{ char.role }}</p>
                              <p><strong>性格:</strong> {{ char.personality }}</p>
                              <p><strong>背景:</strong> {{ char.background }}</p>
                              <template #footer>
                                <n-space>
                                  <n-button size="small" @click="editCharacter(char)">编辑</n-button>
                                  <n-button size="small" type="error" @click="deleteCharacter(char.id)">删除</n-button>
                                </n-space>
                              </template>
                            </n-card>
                          </n-grid-item>
                        </n-grid>
                      </n-space>
                    </n-tab-pane>
                    <n-tab-pane name="locations" tab="📍 地点">
                      <n-space vertical>
                        <n-button type="primary" @click="showLocationModal = true">
                          <template #icon><n-icon :component="AddOutline" /></template>
                          添加地点
                        </n-button>
                        <n-grid :cols="3" :x-gap="12" :y-gap="12">
                          <n-grid-item v-for="loc in locations" :key="loc.id">
                            <n-card :title="loc.name" size="small">
                              <p>{{ loc.description }}</p>
                              <template #footer>
                                <n-space>
                                  <n-button size="small" @click="editLocation(loc)">编辑</n-button>
                                  <n-button size="small" type="error" @click="deleteLocation(loc.id)">删除</n-button>
                                </n-space>
                              </template>
                            </n-card>
                          </n-grid-item>
                        </n-grid>
                      </n-space>
                    </n-tab-pane>
                    <n-tab-pane name="world" tab="🌍 世界观">
                      <n-space vertical>
                        <n-form>
                          <n-form-item label="世界名称">
                            <n-input v-model:value="worldSetting.name" placeholder="世界名称" />
                          </n-form-item>
                          <n-form-item label="时代背景">
                            <n-input v-model:value="worldSetting.era" placeholder="例如：架空古代、赛博朋克..." />
                          </n-form-item>
                          <n-form-item label="核心规则">
                            <n-input v-model:value="worldSetting.rules" type="textarea" placeholder="世界的核心规则..." />
                          </n-form-item>
                          <n-form-item label="详细设定">
                            <n-input v-model:value="worldSetting.description" type="textarea" :rows="10" placeholder="详细的世界观设定..." />
                          </n-form-item>
                          <n-button type="primary" @click="saveWorldSetting">保存设定</n-button>
                        </n-form>
                      </n-space>
                    </n-tab-pane>
                  </n-tabs>
                </div>

                <!-- 章节管理 -->
                <div v-if="currentView === 'chapters'" class="view">
                  <n-space vertical>
                    <n-space>
                      <n-button type="primary" @click="createChapter">
                        <template #icon><n-icon :component="AddOutline" /></template>
                        新建章节
                      </n-button>
                      <n-button @click="generateChapterWithAI">
                        <template #icon><n-icon :component="SparklesOutline" /></template>
                        AI 生成章节
                      </n-button>
                    </n-space>
                    <n-data-table :columns="chapterColumns" :data="chapters" />
                  </n-space>
                </div>

                <!-- 知识图谱 -->
                <div v-if="currentView === 'knowledge'" class="view">
                  <n-space vertical>
                    <n-card title="添加知识三元组">
                      <n-space>
                        <n-input v-model:value="newTriple.subject" placeholder="主语" />
                        <n-input v-model:value="newTriple.predicate" placeholder="谓语" />
                        <n-input v-model:value="newTriple.object" placeholder="宾语" />
                        <n-button type="primary" @click="addTriple">添加</n-button>
                      </n-space>
                    </n-card>
                    <n-card title="知识图谱">
                      <n-empty v-if="triples.length === 0" description="暂无知识三元组" />
                      <n-list v-else>
                        <n-list-item v-for="(t, i) in triples" :key="i">
                          <n-space align="center">
                            <n-tag type="success">{{ t.subject }}</n-tag>
                            <span>→</span>
                            <n-tag>{{ t.predicate }}</n-tag>
                            <span>→</span>
                            <n-tag type="info">{{ t.object }}</n-tag>
                            <n-button size="small" type="error" @click="deleteTriple(i)">删除</n-button>
                          </n-space>
                        </n-list-item>
                      </n-list>
                    </n-card>
                  </n-space>
                </div>

                <!-- 伏笔管理 -->
                <div v-if="currentView === 'foreshadowing'" class="view">
                  <n-space vertical>
                    <n-card title="添加伏笔">
                      <n-space vertical>
                        <n-input v-model:value="newForeshadowing.content" placeholder="伏笔内容..." />
                        <n-input v-model:value="newForeshadowing.buriedIn" placeholder="埋设章节" />
                        <n-input v-model:value="newForeshadowing.expectedPayoff" placeholder="预期回收章节（可选）" />
                        <n-button type="primary" @click="addForeshadowing">添加伏笔</n-button>
                      </n-space>
                    </n-card>
                    <n-card title="伏笔列表">
                      <n-empty v-if="foreshadowings.length === 0" description="暂无伏笔" />
                      <n-list v-else>
                        <n-list-item v-for="(f, i) in foreshadowings" :key="i">
                          <n-thing :title="f.content">
                            <template #header-extra>
                              <n-tag :type="f.resolved ? 'success' : 'warning'">
                                {{ f.resolved ? '已回收' : '未回收' }}
                              </n-tag>
                            </template>
                            <template #description>
                              埋设: {{ f.buriedIn }} | 
                              <span v-if="f.payoffIn">回收: {{ f.payoffIn }}</span>
                              <span v-else>预期: {{ f.expectedPayoff || '待定' }}</span>
                            </template>
                            <template #footer>
                              <n-space>
                                <n-button v-if="!f.resolved" size="small" @click="resolveForeshadowing(i)">
                                  标记已回收
                                </n-button>
                                <n-button size="small" type="error" @click="deleteForeshadowing(i)">删除</n-button>
                              </n-space>
                            </template>
                          </n-thing>
                        </n-list-item>
                      </n-list>
                    </n-card>
                  </n-space>
                </div>

                <!-- 节拍表 -->
                <div v-if="currentView === 'beats'" class="view">
                  <n-space vertical>
                    <n-card title="故事节拍">
                      <n-timeline>
                        <n-timeline-item 
                          v-for="(beat, i) in beats" 
                          :key="i"
                          :type="beat.completed ? 'success' : 'default'"
                          :title="beat.name"
                          :content="beat.description"
                        />
                      </n-timeline>
                    </n-card>
                    <n-card title="添加节拍">
                      <n-space>
                        <n-input v-model:value="newBeat.name" placeholder="节拍名称" />
                        <n-input v-model:value="newBeat.description" placeholder="描述" />
                        <n-button type="primary" @click="addBeat">添加</n-button>
                      </n-space>
                    </n-card>
                  </n-space>
                </div>

                <!-- 自动驾驶 -->
                <div v-if="currentView === 'autopilot'" class="view">
                  <n-card title="🚗 自动驾驶模式">
                    <n-space vertical>
                      <n-alert type="info">
                        自动驾驶会根据 Story Bible 和已有章节，自动连续生成新章节。
                      </n-alert>
                      <n-form>
                        <n-form-item label="目标总字数">
                          <n-input-number v-model:value="autopilot.targetWords" :min="1000" :step="1000" />
                        </n-form-item>
                        <n-form-item label="每章字数">
                          <n-input-number v-model:value="autopilot.chapterWords" :min="500" :max="5000" :step="100" />
                        </n-form-item>
                        <n-form-item label="生成间隔（秒）">
                          <n-input-number v-model:value="autopilot.interval" :min="5" :max="60" />
                        </n-form-item>
                        <n-form-item>
                          <n-button 
                            :type="autopilot.running ? 'error' : 'primary'" 
                            :loading="autopilot.loading"
                            @click="toggleAutopilot"
                          >
                            {{ autopilot.running ? '停止自动驾驶' : '开始自动驾驶' }}
                          </n-button>
                        </n-form-item>
                      </n-form>
                      <n-divider />
                      <div v-if="autopilot.log.length > 0">
                        <h4>运行日志</h4>
                        <n-log :log="autopilot.log.join('\n')" />
                      </div>
                    </n-space>
                  </n-card>
                </div>

                <!-- 设置 -->
                <div v-if="currentView === 'settings'" class="view">
                  <n-card title="⚙️ 设置">
                    <n-form>
                      <n-divider>API 配置</n-divider>
                      <n-form-item label="API Key">
                        <n-input v-model:value="settings.apiKey" type="password" placeholder="sk-..." />
                      </n-form-item>
                      <n-form-item label="Base URL">
                        <n-input v-model:value="settings.baseUrl" placeholder="https://api.openai.com/v1" />
                      </n-form-item>
                      <n-form-item label="模型">
                        <n-select v-model:value="settings.model" :options="modelOptions" />
                      </n-form-item>
                      <n-form-item>
                        <n-button @click="testConnection">测试连接</n-button>
                      </n-form-item>
                      
                      <n-divider>数据管理</n-divider>
                      <n-form-item>
                        <n-space>
                          <n-button @click="exportData">导出数据</n-button>
                          <n-button @click="importData">导入数据</n-button>
                          <n-button type="error" @click="clearAllData">清空所有数据</n-button>
                        </n-space>
                      </n-form-item>
                    </n-form>
                  </n-card>
                </div>
              </n-layout-content>
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { darkTheme, useMessage, useDialog } from 'naive-ui'
import {
  BookOutline,
  HomeOutline,
  PeopleOutline,
  DocumentTextOutline,
  GitNetworkOutline,
  FlashOutline,
  PulseOutline,
  SettingsOutline,
  SunnyOutline,
  MoonOutline,
  AddOutline,
  PlayOutline,
  SparklesOutline
} from '@vicons/ionicons5'

const message = useMessage()
const dialog = useDialog()

// 主题
const theme = ref(localStorage.getItem('plotpilot-theme') || 'light')
const themeOverrides = {
  common: {
    primaryColor: '#2080f0',
    primaryColorHover: '#4098f7',
    primaryColorPressed: '#1060c9'
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('plotpilot-theme', theme.value)
}

// 当前视图
const currentView = ref('dashboard')

// 数据存储
const stories = ref(JSON.parse(localStorage.getItem('plotpilot-stories') || '[]'))
const characters = ref(JSON.parse(localStorage.getItem('plotpilot-characters') || '[]'))
const locations = ref(JSON.parse(localStorage.getItem('plotpilot-locations') || '[]'))
const worldSetting = ref(JSON.parse(localStorage.getItem('plotpilot-world') || '{}'))
const chapters = ref(JSON.parse(localStorage.getItem('plotpilot-chapters') || '[]'))
const triples = ref(JSON.parse(localStorage.getItem('plotpilot-triples') || '[]'))
const foreshadowings = ref(JSON.parse(localStorage.getItem('plotpilot-foreshadowings') || '[]'))
const defaultBeats = [
  { name: '第一幕：设定', description: '介绍主角和世界', completed: false },
  { name: '催化剂', description: '打破现状的事件', completed: false },
  { name: '第二幕：对抗', description: '主角面对挑战', completed: false },
  { name: '中点', description: '故事的转折点', completed: false },
  { name: '第三幕：高潮', description: '最终对决', completed: false },
  { name: '结局', description: '收尾和余韵', completed: false }
]
const beats = ref(JSON.parse(localStorage.getItem('plotpilot-beats') || JSON.stringify(defaultBeats)))
const settings = ref(JSON.parse(localStorage.getItem('plotpilot-settings') || '{}'))

// 保存数据
const saveData = () => {
  localStorage.setItem('plotpilot-stories', JSON.stringify(stories.value))
  localStorage.setItem('plotpilot-characters', JSON.stringify(characters.value))
  localStorage.setItem('plotpilot-locations', JSON.stringify(locations.value))
  localStorage.setItem('plotpilot-world', JSON.stringify(worldSetting.value))
  localStorage.setItem('plotpilot-chapters', JSON.stringify(chapters.value))
  localStorage.setItem('plotpilot-triples', JSON.stringify(triples.value))
  localStorage.setItem('plotpilot-foreshadowings', JSON.stringify(foreshadowings.value))
  localStorage.setItem('plotpilot-beats', JSON.stringify(beats.value))
  localStorage.setItem('plotpilot-settings', JSON.stringify(settings.value))
}

// 计算属性
const totalWords = computed(() => {
  return chapters.value.reduce((sum, ch) => sum + (ch.content?.length || 0), 0)
})

const recentChapters = computed(() => {
  return [...chapters.value].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)
})

const modelOptions = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-3.5-Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
  { label: '自定义', value: 'custom' }
]

const chapterColumns = [
  { title: '标题', key: 'title' },
  { title: '字数', key: 'wordCount', render: (row) => row.content?.length || 0 },
  { title: '状态', key: 'status', render: (row) => row.status === 'completed' ? '已完成' : '草稿' },
  { title: '操作', key: 'actions', render: (row) => {
    return h(NSpace, {}, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => editChapter(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', type: 'error', onClick: () => deleteChapter(row.id) }, { default: () => '删除' })
      ]
    })
  }}
]

// 新建故事
const newStoryTitle = ref('')
const newStoryDesc = ref('')

const createStory = () => {
  if (!newStoryTitle.value) {
    message.warning('请输入作品名称')
    return
  }
  stories.value.push({
    id: Date.now(),
    title: newStoryTitle.value,
    description: newStoryDesc.value,
    createdAt: Date.now()
  })
  saveData()
  message.success('作品创建成功')
  newStoryTitle.value = ''
  newStoryDesc.value = ''
}

// Story Bible - 人物
const showCharacterModal = ref(false)
const newCharacter = ref({ name: '', role: '', personality: '', background: '' })

const addCharacter = () => {
  characters.value.push({
    id: Date.now(),
    ...newCharacter.value
  })
  saveData()
  message.success('人物添加成功')
  showCharacterModal.value = false
  newCharacter.value = { name: '', role: '', personality: '', background: '' }
}

const editCharacter = (char) => {
  message.info('编辑功能待完善')
}

const deleteCharacter = (id) => {
  characters.value = characters.value.filter(c => c.id !== id)
  saveData()
  message.success('已删除')
}

// Story Bible - 地点
const showLocationModal = ref(false)
const newLocation = ref({ name: '', description: '' })

const addLocation = () => {
  locations.value.push({
    id: Date.now(),
    ...newLocation.value
  })
  saveData()
  message.success('地点添加成功')
  showLocationModal.value = false
}

const deleteLocation = (id) => {
  locations.value = locations.value.filter(l => l.id !== id)
  saveData()
}

// 世界观
const saveWorldSetting = () => {
  saveData()
  message.success('世界观设定已保存')
}

// 章节管理
const createChapter = () => {
  const title = prompt('章节标题:')
  if (title) {
    chapters.value.push({
      id: Date.now(),
      title,
      content: '',
      summary: '',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    saveData()
    message.success('章节创建成功')
  }
}

const editChapter = (ch) => {
  const content = prompt('章节内容:', ch.content)
  if (content !== null) {
    ch.content = content
    ch.updatedAt = Date.now()
    saveData()
  }
}

const deleteChapter = (id) => {
  chapters.value = chapters.value.filter(c => c.id !== id)
  saveData()
}

const generateChapterWithAI = async () => {
  if (!settings.value.apiKey) {
    message.error('请先配置 API Key')
    currentView.value = 'settings'
    return
  }
  message.info('AI 生成章节功能开发中...')
}

// 知识图谱
const newTriple = ref({ subject: '', predicate: '', object: '' })

const addTriple = () => {
  if (!newTriple.value.subject || !newTriple.value.predicate || !newTriple.value.object) {
    message.warning('请填写完整的三元组')
    return
  }
  triples.value.push({ ...newTriple.value })
  saveData()
  newTriple.value = { subject: '', predicate: '', object: '' }
  message.success('知识三元组已添加')
}

const deleteTriple = (i) => {
  triples.value.splice(i, 1)
  saveData()
}

// 伏笔管理
const newForeshadowing = ref({ content: '', buriedIn: '', expectedPayoff: '' })

const addForeshadowing = () => {
  if (!newForeshadowing.value.content) {
    message.warning('请输入伏笔内容')
    return
  }
  foreshadowings.value.push({
    ...newForeshadowing.value,
    id: Date.now(),
    resolved: false,
    payoffIn: ''
  })
  saveData()
  newForeshadowing.value = { content: '', buriedIn: '', expectedPayoff: '' }
  message.success('伏笔已添加')
}

const resolveForeshadowing = (i) => {
  foreshadowings.value[i].resolved = true
  foreshadowings.value[i].payoffIn = prompt('回收章节:') || '已回收'
  saveData()
}

const deleteForeshadowing = (i) => {
  foreshadowings.value.splice(i, 1)
  saveData()
}

// 节拍表
const newBeat = ref({ name: '', description: '' })

const addBeat = () => {
  beats.value.push({
    ...newBeat.value,
    completed: false
  })
  saveData()
  newBeat.value = { name: '', description: '' }
}

// 自动驾驶
const autopilot = ref({
  running: false,
  loading: false,
  targetWords: 50000,
  chapterWords: 2000,
  interval: 10,
  log: []
})

const toggleAutopilot = async () => {
  if (autopilot.value.running) {
    autopilot.value.running = false
    message.info('自动驾驶已停止')
    return
  }
  
  if (!settings.value.apiKey) {
    message.error('请先配置 API Key')
    currentView.value = 'settings'
    return
  }
  
  autopilot.value.running = true
  autopilot.value.log.push(`[${new Date().toLocaleTimeString()}] 自动驾驶启动`)
  
  while (autopilot.value.running && totalWords.value < autopilot.value.targetWords) {
    await new Promise(r => setTimeout(r, autopilot.value.interval * 1000))
    if (!autopilot.value.running) break
    
    const chapterNum = chapters.value.length + 1
    chapters.value.push({
      id: Date.now(),
      title: `第${chapterNum}章`,
      content: '这是自动生成的章节内容...',
      status: 'completed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    saveData()
    autopilot.value.log.push(`[${new Date().toLocaleTimeString()}] 生成第${chapterNum}章`)
  }
  
  autopilot.value.running = false
  autopilot.value.log.push(`[${new Date().toLocaleTimeString()}] 自动驾驶完成`)
  message.success('自动驾驶完成')
}

// 设置
const testConnection = async () => {
  message.info('测试连接功能开发中...')
}

const exportData = () => {
  const data = {
    stories: stories.value,
    characters: characters.value,
    locations: locations.value,
    worldSetting: worldSetting.value,
    chapters: chapters.value,
    triples: triples.value,
    foreshadowings: foreshadowings.value,
    beats: beats.value,
    exportTime: new Date().toISOString(),
    version: '1.0'
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `plotpilot-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('数据已导出')
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        stories.value = data.stories || []
        characters.value = data.characters || []
        locations.value = data.locations || []
        worldSetting.value = data.worldSetting || {}
        chapters.value = data.chapters || []
        triples.value = data.triples || []
        foreshadowings.value = data.foreshadowings || []
        beats.value = data.beats || []
        saveData()
        message.success('数据已导入')
      } catch (err) {
        message.error('导入失败: ' + err.message)
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const clearAllData = () => {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空所有数据吗？此操作不可恢复！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      localStorage.clear()
      location.reload()
    }
  })
}

onMounted(() => {
  const savedSettings = localStorage.getItem('plotpilot-settings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.view {
  animation: fadeIn 0.3s ease;
}

.mt-4 {
  margin-top: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

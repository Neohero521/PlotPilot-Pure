import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 本地存储封装
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`plotpilot:${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set(key, value) {
    localStorage.setItem(`plotpilot:${key}`, JSON.stringify(value))
  }
}

export const useAppStore = defineStore('app', () => {
  // 主题
  const theme = ref(storage.get('theme', 'light'))
  
  // 当前项目
  const currentProject = ref(storage.get('currentProject', null))
  
  // API 设置
  const apiSettings = ref(storage.get('apiSettings', {
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4'
  }))
  
  // 所有项目
  const projects = ref(storage.get('projects', []))
  
  // 当前项目数据
  const chapters = ref(storage.get('chapters', []))
  const characters = ref(storage.get('characters', []))
  const locations = ref(storage.get('locations', []))
  const worldSetting = ref(storage.get('worldSetting', {}))
  const triples = ref(storage.get('triples', []))
  const foreshadowings = ref(storage.get('foreshadowings', []))
  const beats = ref(storage.get('beats', [
    { id: 1, name: '第一幕：设定', description: '介绍主角和世界', completed: false, type: 'setup' },
    { id: 2, name: '催化剂', description: '打破现状的事件', completed: false, type: 'catalyst' },
    { id: 3, name: '第二幕：对抗', description: '主角面对挑战', completed: false, type: 'confrontation' },
    { id: 4, name: '中点', description: '故事的转折点', completed: false, type: 'midpoint' },
    { id: 5, name: '第三幕：高潮', description: '最终对决', completed: false, type: 'climax' },
    { id: 6, name: '结局', description: '收尾和余韵', completed: false, type: 'resolution' }
  ]))
  const summaries = ref(storage.get('summaries', []))
  const styleAnalysis = ref(storage.get('styleAnalysis', {
    baseline: null,
    history: []
  }))
  
  // 计算属性
  const totalWords = computed(() => {
    return chapters.value.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
  })
  
  const completedChapters = computed(() => {
    return chapters.value.filter(ch => ch.status === 'completed').length
  })
  
  const unresolvedForeshadowings = computed(() => {
    return foreshadowings.value.filter(f => !f.resolved).length
  })
  
  const progressPercent = computed(() => {
    const totalBeats = beats.value.length
    if (totalBeats === 0) return 0
    const completed = beats.value.filter(b => b.completed).length
    return Math.round((completed / totalBeats) * 100)
  })
  
  // 持久化方法
  const saveAll = () => {
    storage.set('theme', theme.value)
    storage.set('currentProject', currentProject.value)
    storage.set('apiSettings', apiSettings.value)
    storage.set('projects', projects.value)
    storage.set('chapters', chapters.value)
    storage.set('characters', characters.value)
    storage.set('locations', locations.value)
    storage.set('worldSetting', worldSetting.value)
    storage.set('triples', triples.value)
    storage.set('foreshadowings', foreshadowings.value)
    storage.set('beats', beats.value)
    storage.set('summaries', summaries.value)
    storage.set('styleAnalysis', styleAnalysis.value)
  }
  
  // 项目操作
  const createProject = (name, description = '') => {
    const project = {
      id: Date.now(),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    projects.value.push(project)
    currentProject.value = project
    // 清空数据
    chapters.value = []
    characters.value = []
    locations.value = []
    worldSetting.value = {}
    triples.value = []
    foreshadowings.value = []
    beats.value = beats.value.map(b => ({ ...b, completed: false }))
    summaries.value = []
    saveAll()
    return project
  }
  
  const switchProject = (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      currentProject.value = project
      // 加载项目数据（前缀区分）
      chapters.value = storage.get(`project:${projectId}:chapters`, [])
      characters.value = storage.get(`project:${projectId}:characters`, [])
      locations.value = storage.get(`project:${projectId}:locations`, [])
      worldSetting.value = storage.get(`project:${projectId}:worldSetting`, {})
      triples.value = storage.get(`project:${projectId}:triples`, [])
      foreshadowings.value = storage.get(`project:${projectId}:foreshadowings`, [])
      beats.value = storage.get(`project:${projectId}:beats`, beats.value)
      summaries.value = storage.get(`project:${projectId}:summaries`, [])
    }
  }
  
  const saveProjectData = () => {
    if (!currentProject.value) return
    const pid = currentProject.value.id
    storage.set(`project:${pid}:chapters`, chapters.value)
    storage.set(`project:${pid}:characters`, characters.value)
    storage.set(`project:${pid}:locations`, locations.value)
    storage.set(`project:${pid}:worldSetting`, worldSetting.value)
    storage.set(`project:${pid}:triples`, triples.value)
    storage.set(`project:${pid}:foreshadowings`, foreshadowings.value)
    storage.set(`project:${pid}:beats`, beats.value)
    storage.set(`project:${pid}:summaries`, summaries.value)
    currentProject.value.updatedAt = Date.now()
    saveAll()
  }
  
  // 章节操作
  const createChapter = (title, content = '') => {
    const chapter = {
      id: Date.now(),
      title,
      content,
      wordCount: content.length,
      summary: '',
      keyEvents: [],
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tension: 5,
      foreshadowingsBuried: [],
      foreshadowingsResolved: []
    }
    chapters.value.push(chapter)
    saveProjectData()
    return chapter
  }
  
  const updateChapter = (id, updates) => {
    const idx = chapters.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      chapters.value[idx] = { 
        ...chapters.value[idx], 
        ...updates, 
        updatedAt: Date.now(),
        wordCount: updates.content?.length || chapters.value[idx].wordCount
      }
      saveProjectData()
    }
  }
  
  const deleteChapter = (id) => {
    chapters.value = chapters.value.filter(c => c.id !== id)
    saveProjectData()
  }
  
  // Story Bible 操作
  const addCharacter = (character) => {
    characters.value.push({
      id: Date.now(),
      ...character,
      createdAt: Date.now()
    })
    saveProjectData()
  }
  
  const updateCharacter = (id, updates) => {
    const idx = characters.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      characters.value[idx] = { ...characters.value[idx], ...updates }
      saveProjectData()
    }
  }
  
  const deleteCharacter = (id) => {
    characters.value = characters.value.filter(c => c.id !== id)
    saveProjectData()
  }
  
  const addLocation = (location) => {
    locations.value.push({
      id: Date.now(),
      ...location,
      createdAt: Date.now()
    })
    saveProjectData()
  }
  
  const updateLocation = (id, updates) => {
    const idx = locations.value.findIndex(l => l.id === id)
    if (idx !== -1) {
      locations.value[idx] = { ...locations.value[idx], ...updates }
      saveProjectData()
    }
  }
  
  const deleteLocation = (id) => {
    locations.value = locations.value.filter(l => l.id !== id)
    saveProjectData()
  }
  
  const updateWorldSetting = (updates) => {
    worldSetting.value = { ...worldSetting.value, ...updates }
    saveProjectData()
  }
  
  // 知识图谱操作
  const addTriple = (subject, predicate, object, sourceChapterId = null) => {
    triples.value.push({
      id: Date.now(),
      subject,
      predicate,
      object,
      sourceChapterId,
      createdAt: Date.now()
    })
    saveProjectData()
  }
  
  const deleteTriple = (id) => {
    triples.value = triples.value.filter(t => t.id !== id)
    saveProjectData()
  }
  
  // 伏笔操作
  const addForeshadowing = (content, buriedIn, expectedPayoff = null) => {
    foreshadowings.value.push({
      id: Date.now(),
      content,
      buriedIn,
      expectedPayoff,
      payoffIn: null,
      resolved: false,
      createdAt: Date.now()
    })
    saveProjectData()
  }
  
  const resolveForeshadowing = (id, payoffIn) => {
    const f = foreshadowings.value.find(f => f.id === id)
    if (f) {
      f.resolved = true
      f.payoffIn = payoffIn
      saveProjectData()
    }
  }
  
  const deleteForeshadowing = (id) => {
    foreshadowings.value = foreshadowings.value.filter(f => f.id !== id)
    saveProjectData()
  }
  
  // 节拍操作
  const updateBeat = (id, updates) => {
    const idx = beats.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      beats.value[idx] = { ...beats.value[idx], ...updates }
      saveProjectData()
    }
  }
  
  const addBeat = (beat) => {
    beats.value.push({
      id: Date.now(),
      ...beat,
      completed: false
    })
    saveProjectData()
  }
  
  const deleteBeat = (id) => {
    beats.value = beats.value.filter(b => b.id !== id)
    saveProjectData()
  }
  
  // 数据导出/导入
  const exportData = () => {
    return {
      version: '1.0',
      exportTime: new Date().toISOString(),
      projects: projects.value,
      currentProject: currentProject.value,
      // 导出所有项目数据
      data: projects.value.map(p => ({
        project: p,
        chapters: storage.get(`project:${p.id}:chapters`, []),
        characters: storage.get(`project:${p.id}:characters`, []),
        locations: storage.get(`project:${p.id}:locations`, []),
        worldSetting: storage.get(`project:${p.id}:worldSetting`, {}),
        triples: storage.get(`project:${p.id}:triples`, []),
        foreshadowings: storage.get(`project:${p.id}:foreshadowings`, []),
        beats: storage.get(`project:${p.id}:beats`, []),
        summaries: storage.get(`project:${p.id}:summaries`, [])
      }))
    }
  }
  
  const importData = (data) => {
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid data format')
    }
    
    // 导入项目
    projects.value = data.projects
    
    // 导入每个项目的数据
    data.data.forEach(item => {
      const pid = item.project.id
      storage.set(`project:${pid}:chapters`, item.chapters || [])
      storage.set(`project:${pid}:characters`, item.characters || [])
      storage.set(`project:${pid}:locations`, item.locations || [])
      storage.set(`project:${pid}:worldSetting`, item.worldSetting || {})
      storage.set(`project:${pid}:triples`, item.triples || [])
      storage.set(`project:${pid}:foreshadowings`, item.foreshadowings || [])
      storage.set(`project:${pid}:beats`, item.beats || [])
      storage.set(`project:${pid}:summaries`, item.summaries || [])
    })
    
    saveAll()
    
    // 恢复当前项目
    if (data.currentProject) {
      switchProject(data.currentProject.id)
    }
  }
  
  return {
    // State
    theme,
    currentProject,
    apiSettings,
    projects,
    chapters,
    characters,
    locations,
    worldSetting,
    triples,
    foreshadowings,
    beats,
    summaries,
    styleAnalysis,
    // Getters
    totalWords,
    completedChapters,
    unresolvedForeshadowings,
    progressPercent,
    // Actions
    saveAll,
    createProject,
    switchProject,
    saveProjectData,
    createChapter,
    updateChapter,
    deleteChapter,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addLocation,
    updateLocation,
    deleteLocation,
    updateWorldSetting,
    addTriple,
    deleteTriple,
    addForeshadowing,
    resolveForeshadowing,
    deleteForeshadowing,
    updateBeat,
    addBeat,
    deleteBeat,
    exportData,
    importData
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'plotpilot_pure_data'

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref([])
  const currentProjectId = ref(null)
  const settings = ref({
    aiProvider: 'openai',
    openaiKey: '',
    openaiModel: 'gpt-4o-mini',
    claudeKey: '',
    claudeModel: 'claude-3-haiku-20240307',
    theme: 'light'
  })

  // Getters
  const currentProject = computed(() => {
    return projects.value.find(p => p.id === currentProjectId.value) || null
  })

  const sortedProjects = computed(() => {
    return [...projects.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        projects.value = parsed.projects || []
        currentProjectId.value = parsed.currentProjectId || null
        settings.value = { ...settings.value, ...(parsed.settings || {}) }
      }
    } catch (e) {
      console.error('Failed to load from storage:', e)
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      const data = {
        projects: projects.value,
        currentProjectId: currentProjectId.value,
        settings: settings.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save to storage:', e)
    }
  }

  // Project actions
  const createProject = (name, description = '') => {
    const project = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Story Bible
      characters: [],
      locations: [],
      items: [],
      lore: [],
      // Chapters
      chapters: [],
      // Beats
      beats: [],
      // Foreshadowing
      foreshadowings: [],
      // Knowledge Graph
      knowledgeNodes: [],
      knowledgeEdges: []
    }
    projects.value.push(project)
    currentProjectId.value = project.id
    saveToStorage()
    return project
  }

  const updateProject = (projectId, updates) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      Object.assign(project, updates, { updatedAt: Date.now() })
      saveToStorage()
    }
  }

  const deleteProject = (projectId) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index > -1) {
      projects.value.splice(index, 1)
      if (currentProjectId.value === projectId) {
        currentProjectId.value = projects.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  const selectProject = (projectId) => {
    currentProjectId.value = projectId
    saveToStorage()
  }

  // Character actions
  const addCharacter = (projectId, character) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      character.id = Date.now().toString(36) + Math.random().toString(36).substr(2)
      character.createdAt = Date.now()
      project.characters.push(character)
      project.updatedAt = Date.now()
      saveToStorage()
      return character
    }
  }

  const updateCharacter = (projectId, characterId, updates) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const char = project.characters.find(c => c.id === characterId)
      if (char) {
        Object.assign(char, updates)
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  const deleteCharacter = (projectId, characterId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const index = project.characters.findIndex(c => c.id === characterId)
      if (index > -1) {
        project.characters.splice(index, 1)
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  // Chapter actions
  const addChapter = (projectId, chapter) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      chapter.id = Date.now().toString(36) + Math.random().toString(36).substr(2)
      chapter.createdAt = Date.now()
      chapter.updatedAt = Date.now()
      chapter.status = chapter.status || 'draft'
      chapter.wordCount = chapter.content?.length || 0
      project.chapters.push(chapter)
      project.updatedAt = Date.now()
      saveToStorage()
      return chapter
    }
  }

  const updateChapter = (projectId, chapterId, updates) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const chapter = project.chapters.find(c => c.id === chapterId)
      if (chapter) {
        Object.assign(chapter, updates)
        chapter.updatedAt = Date.now()
        chapter.wordCount = chapter.content?.length || 0
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  const deleteChapter = (projectId, chapterId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const index = project.chapters.findIndex(c => c.id === chapterId)
      if (index > -1) {
        project.chapters.splice(index, 1)
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  // Foreshadowing actions
  const addForeshadowing = (projectId, foreshadowing) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      foreshadowing.id = Date.now().toString(36) + Math.random().toString(36).substr(2)
      foreshadowing.createdAt = Date.now()
      foreshadowing.status = foreshadowing.status || 'planted'
      project.foreshadowings.push(foreshadowing)
      project.updatedAt = Date.now()
      saveToStorage()
      return foreshadowing
    }
  }

  const updateForeshadowing = (projectId, foreshadowingId, updates) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const fs = project.foreshadowings.find(f => f.id === foreshadowingId)
      if (fs) {
        Object.assign(fs, updates)
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  const deleteForeshadowing = (projectId, foreshadowingId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const index = project.foreshadowings.findIndex(f => f.id === foreshadowingId)
      if (index > -1) {
        project.foreshadowings.splice(index, 1)
        project.updatedAt = Date.now()
        saveToStorage()
      }
    }
  }

  // Settings actions
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    saveToStorage()
  }

  // Export/Import
  const exportProject = (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    return project ? JSON.stringify(project, null, 2) : null
  }

  const importProject = (jsonString) => {
    try {
      const project = JSON.parse(jsonString)
      project.id = Date.now().toString(36) + Math.random().toString(36).substr(2)
      project.createdAt = Date.now()
      project.updatedAt = Date.now()
      projects.value.push(project)
      saveToStorage()
      return project
    } catch (e) {
      console.error('Failed to import project:', e)
      return null
    }
  }

  // Initialize
  loadFromStorage()

  return {
    projects,
    currentProjectId,
    currentProject,
    sortedProjects,
    settings,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addChapter,
    updateChapter,
    deleteChapter,
    addForeshadowing,
    updateForeshadowing,
    deleteForeshadowing,
    updateSettings,
    exportProject,
    importProject,
    saveToStorage,
    loadFromStorage
  }
})

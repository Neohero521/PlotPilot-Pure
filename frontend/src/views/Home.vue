<template>
  <div class="home-view">
    <n-layout has-sider class="layout">
      <!-- 左侧项目列表 -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="280"
        :collapsed="isSiderCollapsed"
        show-trigger
        @collapse="isSiderCollapsed = true"
        @expand="isSiderCollapsed = false"
      >
        <div class="sider-content">
          <div class="sider-header">
            <n-button type="primary" block @click="showCreateModal = true">
              <template #icon><n-icon :component="AddOutline" /></template>
              新建项目
            </n-button>
          </div>
          
          <n-divider />
          
          <n-list hoverable clickable>
            <n-list-item
              v-for="project in store.sortedProjects"
              :key="project.id"
              :class="{ active: store.currentProjectId === project.id }"
              @click="selectProject(project.id)"
            >
              <n-thing :title="project.name" :description="formatDate(project.updatedAt)">
                <template #description>
                  <n-ellipsis :line-clamp="1">
                    {{ project.description || '暂无描述' }}
                  </n-ellipsis>
                  <div class="project-meta">
                    <n-tag size="tiny" :bordered="false">
                      {{ project.chapters?.length || 0 }} 章节
                    </n-tag>
                    <n-tag size="tiny" :bordered="false">
                      {{ project.characters?.length || 0 }} 角色
                    </n-tag>
                  </div>
                </template>
              </n-thing>
              <template #suffix>
                <n-dropdown
                  trigger="click"
                  :options="projectOptions"
                  @select="(key) => handleProjectAction(key, project)"
                >
                  <n-button text>
                    <n-icon :component="EllipsisHorizontalOutline" />
                  </n-button>
                </n-dropdown>
              </template>
            </n-list-item>
          </n-list>
          
          <n-empty v-if="store.projects.length === 0" description="暂无项目，创建一个吧！" />
        </div>
      </n-layout-sider>

      <!-- 主内容区 -->
      <n-layout-content class="main-content">
        <div v-if="!store.currentProject" class="empty-state">
          <n-empty description="选择一个项目或创建新项目">
            <template #extra>
              <n-button type="primary" @click="showCreateModal = true">
                创建项目
              </n-button>
            </template>
          </n-empty>
        </div>
        
        <div v-else class="project-dashboard">
          <!-- 项目头部 -->
          <n-card class="project-header" :bordered="false">
            <div class="header-content">
              <div class="title-section">
                <n-input
                  v-model:value="editingTitle"
                  v-if="isEditingTitle"
                  @blur="saveTitle"
                  @keyup.enter="saveTitle"
                  ref="titleInputRef"
                />
                <h1 v-else @click="startEditTitle" class="project-title">
                  {{ store.currentProject.name }}
                  <n-icon :component="CreateOutline" class="edit-icon" />
                </h1>
                <n-text depth="3">{{ store.currentProject.description || '点击编辑描述' }}</n-text>
              </div>
              <n-space>
                <n-button @click="exportProject">
                  <template #icon><n-icon :component="DownloadOutline" /></template>
                  导出
                </n-button>
                <n-upload
                  :show-file-list="false"
                  accept=".json"
                  @change="handleImport"
                >
                  <n-button>
                    <template #icon><n-icon :component="UploadOutline" /></template>
                    导入
                  </n-button>
                </n-upload>
              </n-space>
            </div>
          </n-card>

          <!-- 统计卡片 -->
          <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
            <n-grid-item>
              <n-card class="stat-card">
                <n-statistic label="总章节数" :value="store.currentProject.chapters?.length || 0" />
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card">
                <n-statistic label="总字数" :value="totalWordCount" />
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card">
                <n-statistic label="角色数" :value="store.currentProject.characters?.length || 0" />
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card">
                <n-statistic label="伏笔数" :value="store.currentProject.foreshadowings?.length || 0" />
              </n-card>
            </n-grid-item>
          </n-grid>

          <!-- 快捷操作 -->
          <n-card title="快捷操作" class="quick-actions">
            <n-space>
              <n-button @click="$emit('navigate', 'chapters')">
                <template #icon><n-icon :component="DocumentTextOutline" /></template>
                章节管理
              </n-button>
              <n-button @click="$emit('navigate', 'bible')">
                <template #icon><n-icon :component="PeopleOutline" /></template>
                Story Bible
              </n-button>
              <n-button @click="$emit('navigate', 'foreshadowing')">
                <template #icon><n-icon :component="FlashOutline" /></template>
                伏笔管理
              </n-button>
              <n-button @click="$emit('navigate', 'beats')">
                <template #icon><n-icon :component="PulseOutline" /></template>
                节拍表
              </n-button>
            </n-space>
          </n-card>

          <!-- 最近章节 -->
          <n-card title="最近章节" class="recent-chapters">
            <n-empty v-if="recentChapters.length === 0" description="暂无章节" />
            <n-list v-else>
              <n-list-item
                v-for="chapter in recentChapters"
                :key="chapter.id"
                @click="$emit('navigate', 'chapters', chapter.id)"
              >
                <n-thing :title="chapter.title" :description="chapter.summary || '无摘要'">
                  <template #header-extra>
                    <n-tag :type="chapter.status === 'completed' ? 'success' : 'warning'" size="small">
                      {{ chapter.status === 'completed' ? '已完成' : '草稿' }}
                    </n-tag>
                  </template>
                  <template #footer>
                    {{ formatDate(chapter.updatedAt) }} · {{ chapter.wordCount || 0 }} 字
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-card>
        </div>
      </n-layout-content>
    </n-layout>

    <!-- 创建项目弹窗 -->
    <n-modal v-model:show="showCreateModal" title="创建新项目" preset="card" style="width: 500px">
      <n-form :model="newProject" label-placement="top">
        <n-form-item label="项目名称" required>
          <n-input v-model:value="newProject.name" placeholder="输入项目名称" />
        </n-form-item>
        <n-form-item label="项目描述">
          <n-input
            v-model:value="newProject.description"
            type="textarea"
            placeholder="简短描述你的作品..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="createProject" :disabled="!newProject.name.trim()">
            创建
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import {
  AddOutline,
  EllipsisHorizontalOutline,
  CreateOutline,
  DownloadOutline,
  UploadOutline,
  DocumentTextOutline,
  PeopleOutline,
  FlashOutline,
  PulseOutline
} from '@vicons/ionicons5'
import { useProjectStore } from '../stores/project'

const store = useProjectStore()
const message = useMessage()
const emit = defineEmits(['navigate'])

// State
const isSiderCollapsed = ref(false)
const showCreateModal = ref(false)
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInputRef = ref(null)

const newProject = ref({
  name: '',
  description: ''
})

// Computed
const totalWordCount = computed(() => {
  if (!store.currentProject) return 0
  return store.currentProject.chapters?.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) || 0
})

const recentChapters = computed(() => {
  if (!store.currentProject) return []
  return [...(store.currentProject.chapters || [])]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)
})

const projectOptions = [
  { label: '重命名', key: 'rename' },
  { label: '导出', key: 'export' },
  { label: '删除', key: 'delete' }
]

// Methods
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const selectProject = (id) => {
  store.selectProject(id)
}

const createProject = () => {
  if (!newProject.value.name.trim()) return
  
  store.createProject(newProject.value.name, newProject.value.description)
  message.success('项目创建成功')
  showCreateModal.value = false
  newProject.value = { name: '', description: '' }
}

const handleProjectAction = (key, project) => {
  switch (key) {
    case 'rename':
      editingTitle.value = project.name
      store.selectProject(project.id)
      startEditTitle()
      break
    case 'export':
      exportProjectData(project)
      break
    case 'delete':
      if (confirm(`确定要删除项目"${project.name}"吗？此操作不可恢复。`)) {
        store.deleteProject(project.id)
        message.success('项目已删除')
      }
      break
  }
}

const startEditTitle = () => {
  if (!store.currentProject) return
  editingTitle.value = store.currentProject.name
  isEditingTitle.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

const saveTitle = () => {
  if (editingTitle.value.trim() && store.currentProject) {
    store.updateProject(store.currentProject.id, { name: editingTitle.value.trim() })
  }
  isEditingTitle.value = false
}

const exportProject = () => {
  if (!store.currentProject) return
  exportProjectData(store.currentProject)
}

const exportProjectData = (project) => {
  const data = store.exportProject(project.id)
  if (data) {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    message.success('项目导出成功')
  }
}

const handleImport = ({ file }) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const project = store.importProject(e.target.result)
      if (project) {
        message.success('项目导入成功')
        store.selectProject(project.id)
      } else {
        message.error('导入失败')
      }
    } catch (err) {
      message.error('文件格式错误')
    }
  }
  reader.readAsText(file.file)
}
</script>

<style scoped>
.home-view {
  height: 100%;
}

.layout {
  height: 100%;
}

.sider-content {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.sider-header {
  margin-bottom: 8px;
}

.main-content {
  padding: 24px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.project-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-title {
  margin: 0 0 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.project-title:hover .edit-icon {
  opacity: 1;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.quick-actions {
  margin-bottom: 24px;
}

.recent-chapters {
  margin-bottom: 24px;
}

.project-meta {
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

:deep(.n-list-item.active) {
  background-color: var(--n-color-hover);
}
</style>

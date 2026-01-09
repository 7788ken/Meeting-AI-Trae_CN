<template>
  <div class="home">
    <h1>AI会议助手</h1>
    <div class="create-meeting">
      <el-button type="primary" @click="showCreateDialog = true">创建新会议</el-button>
    </div>
    
    <el-dialog
      v-model="showCreateDialog"
      title="创建新会议"
      width="500px"
    >
      <el-form :model="meetingForm" label-width="80px">
        <el-form-item label="会议名称">
          <el-input v-model="meetingForm.name" placeholder="请输入会议名称" />
        </el-form-item>
        <el-form-item label="录音质量">
          <el-select v-model="meetingForm.recordingQuality" placeholder="请选择录音质量">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="转写语言">
          <el-select v-model="meetingForm.transcriptionLanguage" placeholder="请选择转写语言">
            <el-option label="中文" value="zh-CN" />
            <el-option label="英文" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createMeeting">创建</el-button>
      </template>
    </el-dialog>
    
    <div class="meeting-list">
      <h2>会议列表</h2>
      <el-skeleton :rows="3" animated v-if="loading" />
      <el-empty v-else-if="meetings.length === 0" description="暂无会议" />
      <el-card v-for="meeting in meetings" :key="meeting.id" class="meeting-card">
        <h3>{{ meeting.name }}</h3>
        <p>状态：
          <el-tag :type="meeting.status === 'active' ? 'success' : 'info'">
            {{ meeting.status === 'active' ? '进行中' : '已结束' }}
          </el-tag>
        </p>
        <p>创建时间：{{ new Date(meeting.createdAt).toLocaleString() }}</p>
        <el-button type="primary" @click="joinMeeting(meeting.id)">进入会议</el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { meetingApi } from '../api/meeting'
import type { Meeting } from '../stores/meeting'
import { ElMessage } from 'element-plus'

const router = useRouter()
const showCreateDialog = ref(false)
const loading = ref(false)
const meetings = ref<Meeting[]>([])

const meetingForm = ref({
  name: '',
  recordingQuality: 'medium',
  transcriptionLanguage: 'zh-CN'
})

// 获取会议列表
const fetchMeetings = async () => {
  loading.value = true
  try {
    const response = await meetingApi.getMeetingList()
    meetings.value = response.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取会议列表失败')
    console.error('获取会议列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建会议
const createMeeting = async () => {
  if (!meetingForm.value.name) {
    ElMessage.warning('请输入会议名称')
    return
  }
  
  loading.value = true
  try {
    const meeting = await meetingApi.createMeeting({
      name: meetingForm.value.name,
      recording_quality: meetingForm.value.recordingQuality,
      transcription_language: meetingForm.value.transcriptionLanguage
    })
    
    ElMessage.success('会议创建成功')
    showCreateDialog.value = false
    fetchMeetings()
    
    // 跳转到会议页面
    router.push(`/meeting/${meeting.id}`)
  } catch (error: any) {
    ElMessage.error(error.message || '创建会议失败')
    console.error('创建会议失败:', error)
  } finally {
    loading.value = false
  }
}

const joinMeeting = (id: string) => {
  router.push(`/meeting/${id}`)
}

// 页面加载时获取会议列表
onMounted(() => {
  fetchMeetings()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.create-meeting {
  margin: 20px 0;
}

.meeting-list {
  margin-top: 30px;
}

.meeting-card {
  margin: 10px 0;
}
</style>

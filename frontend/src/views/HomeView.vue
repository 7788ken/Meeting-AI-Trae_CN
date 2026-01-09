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
      <el-empty v-if="meetings.length === 0" description="暂无会议" />
      <el-card v-for="meeting in meetings" :key="meeting.id" class="meeting-card">
        <h3>{{ meeting.name }}</h3>
        <p>状态：{{ meeting.status }}</p>
        <p>创建时间：{{ meeting.createdAt }}</p>
        <el-button type="primary" @click="joinMeeting(meeting.id)">进入会议</el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showCreateDialog = ref(false)
const meetings = ref([])

const meetingForm = ref({
  name: '',
  recordingQuality: 'medium',
  transcriptionLanguage: 'zh-CN'
})

const createMeeting = () => {
  // 这里将在后续实现API调用
  console.log('创建会议:', meetingForm.value)
  showCreateDialog.value = false
  // 暂时跳转到模拟的会议页面
  router.push('/meeting/1')
}

const joinMeeting = (id: string) => {
  router.push(`/meeting/${id}`)
}
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

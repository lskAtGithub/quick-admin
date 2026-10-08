<template>
  <div class="qa-exception">
    <el-result icon="info" title="404" sub-title="抱歉，你访问的页面不存在">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

defineOptions({ name: "Exception404" });
const router = useRouter();
const goHome = () => router.replace("/home");
</script>

<style scoped>
.qa-exception {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}
</style>

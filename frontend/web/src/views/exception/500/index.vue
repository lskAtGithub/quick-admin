<template>
  <div class="qa-exception">
    <el-result icon="error" title="500" sub-title="抱歉，服务器出错了">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

defineOptions({ name: "Exception500" });
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

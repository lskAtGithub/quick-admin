<template>
  <div class="qa-exception">
    <el-result icon="warning" title="401" sub-title="抱歉，你无权访问该页面">
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

defineOptions({ name: "Exception401" });
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

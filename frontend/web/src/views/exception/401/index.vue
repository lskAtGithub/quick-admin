<template>
  <div class="qa-exception">
    <el-result icon="warning" title="401" :sub-title="$t('exception.noAccess')">
      <template #extra>
        <el-button type="primary" @click="goHome">{{ $t('exception.backHome') }}</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineOptions({ name: 'Exception401' });
const router = useRouter();
const goHome = () => router.replace('/home');
</script>

<style scoped>
.qa-exception {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--default-box-color);
}
</style>

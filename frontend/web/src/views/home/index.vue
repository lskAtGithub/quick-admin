<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section qa-anim-item" style="--qa-anim-delay: 0ms">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ greeting }}，{{ userStore.userInfo?.name || userStore.userInfo?.username }}</h1>
        <p class="welcome-subtitle">{{ $t('home.welcome') }}</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-item">
          <div class="stat-label">{{ $t('home.today') }}</div>
          <div class="stat-value">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ElRow :gutter="16" class="stats-row">
      <ElCol :xs="12" :sm="6" v-for="(stat, index) in statsCards" :key="stat.title" class="qa-anim-item" :style="{ '--qa-anim-delay': `${80 + index * 60}ms` }">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.iconBg }">
            <QaSvgIcon :icon="stat.icon" :size="28" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-number">{{ displayStats[index] }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 快捷入口 -->
    <ElCard class="section-card qa-anim-item" style="--qa-anim-delay: 350ms" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ $t('home.quickLinks') }}</span>
        </div>
      </template>
      <ElRow :gutter="16">
        <ElCol :xs="8" :sm="4" v-for="(link, index) in quickLinks" :key="link.title" class="qa-anim-item" :style="{ '--qa-anim-delay': `${400 + index * 50}ms` }">
          <div class="quick-link" @click="navigateTo(link.path)">
            <div class="link-icon">
              <QaSvgIcon :icon="link.icon" :size="22" />
            </div>
            <div class="link-title">{{ link.title }}</div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 系统信息 -->
    <ElRow :gutter="16" class="info-row">
      <ElCol :xs="24" :sm="12" class="qa-anim-item" style="--qa-anim-delay: 500ms">
        <ElCard class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t('home.systemInfo') }}</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item" v-for="info in systemInfo" :key="info.label">
              <span class="info-label">{{ info.label }}</span>
              <span class="info-value">{{ info.value }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" class="qa-anim-item" style="--qa-anim-delay: 560ms">
        <ElCard class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t('home.recentLogin') }}</span>
            </div>
          </template>
          <div class="login-info">
            <div class="info-item">
              <span class="info-label">{{ $t('home.lastLoginTime') }}</span>
              <span class="info-value">{{ userStore.userInfo?.last_login || $t('home.firstLogin') }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('home.currentRole') }}</span>
              <span class="info-value">
                <ElTag v-for="role in userStore.userInfo?.roles || []" :key="role.id" size="small" class="role-tag">
                  {{ role.name }}
                </ElTag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('home.userDept') }}</span>
              <span class="info-value">{{ userStore.userInfo?.dept?.name || $t('home.unassigned') }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import { useUserStore } from '@/store';
import { UserAPI } from '@/api/module_system/user';
import { RoleAPI } from '@/api/module_system/role';
import { DeptAPI } from '@/api/module_system/dept';
import { MenuAPI } from '@/api/module_system/menu';

defineOptions({ name: 'QaHome' });

const router = useRouter();
const userStore = useUserStore();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 9) return $t('home.greeting.morning');
  if (hour >= 9 && hour < 11) return $t('home.greeting.forenoon');
  if (hour >= 11 && hour < 13) return $t('home.greeting.noon');
  if (hour >= 13 && hour < 18) return $t('home.greeting.afternoon');
  if (hour >= 18 && hour < 22) return $t('home.greeting.evening');
  return $t('home.greeting.night');
});

const currentDate = computed(() => {
  const date = new Date();
  return $t('home.dateFmt', { month: date.getMonth() + 1, day: date.getDate(), weekday: $t(`home.week.${date.getDay()}`) });
});

const stats = ref({
  userCount: 0,
  roleCount: 0,
  deptCount: 0,
  menuCount: 0
});

const statsCards = computed(() => [
  {
    title: $t('home.stat.user'),
    value: stats.value.userCount,
    icon: 'ri:user-line',
    iconBg: 'color-mix(in srgb, var(--el-color-primary) 12%, transparent)'
  },
  {
    title: $t('home.stat.role'),
    value: stats.value.roleCount,
    icon: 'ri:team-line',
    iconBg: 'color-mix(in srgb, var(--qa-success) 12%, transparent)'
  },
  {
    title: $t('home.stat.dept'),
    value: stats.value.deptCount,
    icon: 'ri:organization-chart',
    iconBg: 'color-mix(in srgb, var(--el-color-primary) 8%, transparent)'
  },
  {
    title: $t('home.stat.menu'),
    value: stats.value.menuCount,
    icon: 'ri:menu-line',
    iconBg: 'color-mix(in srgb, var(--qa-warning) 12%, transparent)'
  }
]);

const quickLinks = computed(() => [
  { title: $t('menus.system.user.title'), icon: 'ri:user-line', path: '/system/user' },
  { title: $t('menus.system.role.title'), icon: 'ri:team-line', path: '/system/role' },
  { title: $t('menus.system.menu.title'), icon: 'ri:menu-line', path: '/system/menu' },
  { title: $t('menus.system.dept.title'), icon: 'ri:organization-chart', path: '/system/dept' },
  { title: $t('menus.system.dict.title'), icon: 'ri:book-line', path: '/system/dict' },
  { title: $t('topBar.user.userCenter'), icon: 'ri:user-settings-line', path: '/profile' }
]);

const systemInfo = computed(() => [
  { label: $t('home.version'), value: 'v0.1.0' },
  { label: $t('home.vueVersion'), value: '3.5.x' },
  { label: 'Element Plus', value: '2.9.x' },
  { label: $t('home.backendFramework'), value: 'FastAPI' }
]);

const navigateTo = (path) => {
  router.push(path);
};

const countTreeNodes = (tree) => {
  if (!Array.isArray(tree)) return 0;
  let count = 0;
  for (const node of tree) {
    count += 1;
    if (node.children?.length) {
      count += countTreeNodes(node.children);
    }
  }
  return count;
};

const displayStats = reactive([0, 0, 0, 0]);

function animateCountUp(targetIndex, targetValue, duration = 600) {
  if (targetValue === 0) return;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayStats[targetIndex] = Math.round(eased * targetValue);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const loadStats = async () => {
  try {
    const [userRes, roleRes, deptRes, menuTree] = await Promise.all([
      UserAPI.listUser({ page_no: 1, page_size: 1 }),
      RoleAPI.list({ page_no: 1, page_size: 1 }),
      DeptAPI.list({ page_no: 1, page_size: 1 }),
      MenuAPI.tree()
    ]);
    stats.value = {
      userCount: userRes.data?.total || 0,
      roleCount: roleRes.data?.total || 0,
      deptCount: deptRes.data?.total || 0,
      menuCount: countTreeNodes(menuTree.data)
    };
    await nextTick();
    const targets = [stats.value.userCount, stats.value.roleCount, stats.value.deptCount, stats.value.menuCount];
    targets.forEach((val, i) => animateCountUp(i, val, 500 + i * 80));
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
@keyframes qa-fade-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qa-anim-item {
  animation: qa-fade-rise 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--qa-anim-delay, 0ms);
}

@media (prefers-reduced-motion: reduce) {
  .qa-anim-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.home-container {
  padding: var(--qa-size-page-padding);
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--qa-size-card-padding);
  margin-bottom: var(--qa-size-spacing-lg);
  background: color-mix(in srgb, var(--el-color-primary) 8%, var(--default-box-color));
  border: 1px solid var(--qa-card-border);
  border-radius: calc(var(--custom-radius) + 4px);
  color: var(--qa-gray-900);

  .welcome-content {
    .welcome-title {
      font-size: var(--qa-size-font-2xl);
      font-weight: 600;
      margin: 0 0 var(--qa-size-spacing-sm) 0;
      color: var(--qa-gray-900);
    }

    .welcome-subtitle {
      font-size: var(--qa-size-font-sm);
      color: var(--qa-gray-600);
      margin: 0;
    }
  }

  .welcome-stats {
    .stat-item {
      text-align: right;

      .stat-label {
        font-size: var(--qa-size-font-xs);
        color: var(--qa-gray-500);
        margin-bottom: var(--qa-size-spacing-xs);
      }

      .stat-value {
        font-size: var(--qa-size-font-xl);
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }
}

.stats-row {
  margin-bottom: var(--qa-size-spacing-lg);

  .stat-card {
    padding: var(--qa-size-card-padding);
    border-radius: calc(var(--custom-radius) + 4px);
    background: var(--default-box-color);
    border: 1px solid var(--qa-card-border);
    display: flex;
    align-items: center;
    gap: var(--qa-size-spacing-lg);
    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &:hover {
      box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.03),
        0 1px 2px -1px rgba(0, 0, 0, 0.08);

      .stat-icon {
        transform: scale(1.08);
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: calc(var(--custom-radius) + 2px);
      color: var(--el-color-primary);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .stat-info {
      flex: 1;

      .stat-title {
        font-size: var(--qa-size-font-sm);
        color: var(--qa-gray-600);
        margin-bottom: var(--qa-size-spacing-xs);
      }

      .stat-number {
        font-size: var(--qa-size-font-2xl);
        font-weight: 600;
        color: var(--qa-gray-900);
      }
    }
  }
}

.section-card {
  margin-bottom: var(--qa-size-spacing-lg);
  border-radius: calc(var(--custom-radius) + 2px);

  :deep(.el-card__header) {
    padding: var(--qa-size-spacing-lg) var(--qa-size-card-padding);
    border-bottom: 1px solid var(--default-border);
  }

  :deep(.el-card__body) {
    padding: var(--qa-size-card-padding);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: var(--qa-size-font-lg);
      font-weight: 600;
      color: var(--qa-gray-900);
    }
  }
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--qa-size-spacing-lg) var(--qa-size-spacing-sm);
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: calc(var(--custom-radius) / 2 + 2px);

  &:hover {
    background: var(--qa-hover-color);

    .link-icon {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
      transform: scale(1.1);
    }

    .link-title {
      color: var(--el-color-primary);
    }
  }

  .link-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: calc(var(--custom-radius) + 2px);
    margin-bottom: var(--qa-size-spacing-md);
    color: var(--qa-gray-600);
    background: var(--qa-gray-100);
    transition:
      color 0.2s,
      background 0.2s,
      transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .link-title {
    font-size: var(--qa-size-font-sm);
    color: var(--qa-gray-700);
    font-weight: 500;
    transition: color 0.2s;
  }
}

.info-list,
.login-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--qa-size-spacing-md) 0;
    border-bottom: 1px solid var(--qa-gray-200);

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: var(--qa-size-font-sm);
      color: var(--qa-gray-500);
    }

    .info-value {
      font-size: var(--qa-size-font-sm);
      color: var(--qa-gray-900);
      font-weight: 500;
    }

    .role-tag {
      margin-left: var(--qa-size-spacing-sm);

      &:first-child {
        margin-left: 0;
      }
    }
  }
}

@media (max-width: 800px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: var(--qa-size-spacing-lg);

    .welcome-stats {
      .stat-item {
        text-align: center;
      }
    }
  }
}

@media (max-width: 640px) {
  .home-container {
    padding: var(--qa-size-spacing-sm);
  }
}
</style>

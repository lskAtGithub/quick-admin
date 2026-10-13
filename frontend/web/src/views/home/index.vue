<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ greeting }}，{{ userStore.userInfo?.name || userStore.userInfo?.username }}</h1>
        <p class="welcome-subtitle">欢迎使用 Quick Admin 管理系统</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-item">
          <div class="stat-label">今日日期</div>
          <div class="stat-value">{{ currentDate }}</div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <ElRow :gutter="16" class="stats-row">
      <ElCol :xs="12" :sm="6" v-for="stat in statsCards" :key="stat.title">
        <div class="stat-card" :style="{ background: stat.gradient }">
          <div class="stat-icon">
            <QaSvgIcon :icon="stat.icon" :size="32" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-number">{{ stat.value }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 快捷入口 -->
    <ElCard class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">快捷入口</span>
        </div>
      </template>
      <ElRow :gutter="16">
        <ElCol :xs="8" :sm="4" v-for="link in quickLinks" :key="link.title">
          <div class="quick-link" @click="navigateTo(link.path)">
            <div class="link-icon" :style="{ background: link.color }">
              <QaSvgIcon :icon="link.icon" :size="24" color="#fff" />
            </div>
            <div class="link-title">{{ link.title }}</div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 系统信息 -->
    <ElRow :gutter="16" class="info-row">
      <ElCol :xs="24" :sm="12">
        <ElCard class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">系统信息</span>
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
      <ElCol :xs="24" :sm="12">
        <ElCard class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近登录</span>
            </div>
          </template>
          <div class="login-info">
            <div class="info-item">
              <span class="info-label">上次登录时间</span>
              <span class="info-value">{{ userStore.userInfo?.last_login || '首次登录' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前角色</span>
              <span class="info-value">
                <ElTag v-for="role in userStore.userInfo?.roles || []" :key="role.id" size="small" class="role-tag">
                  {{ role.name }}
                </ElTag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">所属部门</span>
              <span class="info-value">{{ userStore.userInfo?.dept?.name || '未分配' }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
  if (hour >= 6 && hour < 9) return '早上好';
  if (hour >= 9 && hour < 11) return '上午好';
  if (hour >= 11 && hour < 13) return '中午好';
  if (hour >= 13 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 22) return '晚上好';
  return '夜深了';
});

const currentDate = computed(() => {
  const date = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 星期${weekDays[date.getDay()]}`;
});

const stats = ref({
  userCount: 0,
  roleCount: 0,
  deptCount: 0,
  menuCount: 0,
});

const statsCards = computed(() => [
  {
    title: '用户总数',
    value: stats.value.userCount,
    icon: 'ri:user-line',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: '角色总数',
    value: stats.value.roleCount,
    icon: 'ri:team-line',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    title: '部门总数',
    value: stats.value.deptCount,
    icon: 'ri:organization-chart',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    title: '菜单总数',
    value: stats.value.menuCount,
    icon: 'ri:menu-line',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]);

const quickLinks = [
  { title: '用户管理', icon: 'ri:user-line', path: '/system/user', color: '#667eea' },
  { title: '角色管理', icon: 'ri:team-line', path: '/system/role', color: '#f5576c' },
  { title: '菜单管理', icon: 'ri:menu-line', path: '/system/menu', color: '#4facfe' },
  { title: '部门管理', icon: 'ri:organization-chart', path: '/system/dept', color: '#43e97b' },
  { title: '字典管理', icon: 'ri:book-line', path: '/system/dict', color: '#fa709a' },
  { title: '个人中心', icon: 'ri:user-settings-line', path: '/fastlink/current/profile', color: '#38f9d7' },
];

const systemInfo = [
  { label: '系统版本', value: 'v0.1.0' },
  { label: 'Vue 版本', value: '3.5.x' },
  { label: 'Element Plus', value: '2.9.x' },
  { label: '后端框架', value: 'FastAPI' },
];

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

const loadStats = async () => {
  try {
    const [userRes, roleRes, deptRes, menuTree] = await Promise.all([
      UserAPI.listUser({ page_no: 1, page_size: 1 }),
      RoleAPI.list({ page_no: 1, page_size: 1 }),
      DeptAPI.list({ page_no: 1, page_size: 1 }),
      MenuAPI.tree(),
    ]);
    stats.value = {
      userCount: userRes.data?.total || 0,
      roleCount: roleRes.data?.total || 0,
      deptCount: deptRes.data?.total || 0,
      menuCount: countTreeNodes(menuTree.data),
    };
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.home-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);

  .welcome-content {
    .welcome-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .welcome-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .welcome-stats {
    .stat-item {
      text-align: right;

      .stat-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    padding: 24px;
    border-radius: 12px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }

    .stat-info {
      flex: 1;

      .stat-title {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .stat-number {
        font-size: 28px;
        font-weight: 700;
      }
    }
  }
}

.section-card {
  margin-bottom: 20px;
  border-radius: 12px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    background: #f5f7fa;
    transform: translateY(-2px);

    .link-title {
      color: #409eff;
    }
  }

  .link-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .link-title {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    transition: color 0.3s ease;
  }
}

.info-list,
.login-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 14px;
      color: #909399;
    }

    .info-value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }

    .role-tag {
      margin-left: 8px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;

    .welcome-stats {
      .stat-item {
        text-align: center;
      }
    }
  }

  .stats-row {
    .stat-card {
      margin-bottom: 12px;
    }
  }
}
</style>

#!/bin/bash
set -euo pipefail

# ==================== 配置 ====================
# 部署方式：本地开发完成后将项目目录上传至服务器（scp/FTP/面板均可），
# 再在服务器上执行本脚本完成构建与启动——脚本不再从 git 拉取代码。
PROJECT_NAME="QuickAdmin"
WORK_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="${WORK_DIR}/docker"
ENV_FILE="${DOCKER_DIR}/.env"
FRONTEND_DIR="${WORK_DIR}/frontend/web"

COLOR_GREEN='\033[0;32m'; COLOR_BLUE='\033[0;34m'; COLOR_YELLOW='\033[0;33m'; COLOR_RED='\033[0;31m'; COLOR_RESET='\033[0m'

log() {
    local color; local level=${2:-INFO}
    case $level in
        INFO) color="${COLOR_BLUE}" ;; WARN) color="${COLOR_YELLOW}" ;;
        ERROR) color="${COLOR_RED}" ;; SUCCESS) color="${COLOR_GREEN}" ;;
        *) color="${COLOR_RESET}" ;;
    esac
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${1}${COLOR_RESET}"
}

# compose 命令自适应（v2 插件 / v1 独立二进制）
compose() {
    if docker compose version &>/dev/null; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# ==================== 核心函数 ====================

load_env() {
    if [ -f "${ENV_FILE}" ]; then
        set -a; source "${ENV_FILE}"; set +a
        # compose 侧对口令只做默认值兜底（便于本地零配置），上生产不得沿用模板占位值
        if [ "${MYSQL_ROOT_PASSWORD:-}" = "change_me_root_password" ] || [ "${MYSQL_PASSWORD:-}" = "change_me_app_password" ] || [ "${SECRET_KEY:-}" = "change_this_to_a_long_random_string" ]; then
            log "仍在沿用 .env.example 的占位密码/密钥，请在 ${ENV_FILE} 中改为随机值后重试" "ERROR"
            exit 1
        fi
        log "✅ 环境变量已加载" "SUCCESS"
    elif [ -f "${DOCKER_DIR}/.env.example" ]; then
        cp "${DOCKER_DIR}/.env.example" "${ENV_FILE}"
        log "已从 .env.example 生成 ${ENV_FILE}，请填写密码/SECRET_KEY 后重新执行" "WARN"
        exit 1
    else
        log ".env 与 .env.example 均不存在" "ERROR"; exit 1
    fi
}

check_deps() {
    for dir in "${DOCKER_DIR}/mysql/data" "${DOCKER_DIR}/mysql/init" "${DOCKER_DIR}/redis/data" "${DOCKER_DIR}/nginx/ssl" "${WORK_DIR}/backend/static/upload"; do
        [ -d "$dir" ] || mkdir -p "$dir"
    done
    local missing=()
    command -v docker &>/dev/null || missing+=("docker")
    if ! docker compose version &>/dev/null && ! docker-compose --version &>/dev/null; then
        missing+=("docker compose")
    fi
    if [ ${#missing[@]} -gt 0 ]; then
        log "缺少依赖: ${missing[*]}" "ERROR"; exit 1
    fi
    log "✅ 依赖检查通过" "SUCCESS"
}

check_code() {
    local missing=()
    [ -f "${WORK_DIR}/backend/main.py" ] || missing+=("backend/main.py")
    [ -f "${WORK_DIR}/backend/env/.env.prod" ] || missing+=("backend/env/.env.prod")
    [ -f "${DOCKER_DIR}/backend/Dockerfile" ] || missing+=("docker/backend/Dockerfile")
    [ -f "${DOCKER_DIR}/nginx/nginx.conf" ] || missing+=("docker/nginx/nginx.conf")
    [ -f "${FRONTEND_DIR}/.env.production" ] || missing+=("frontend/web/.env.production")
    if [ ${#missing[@]} -gt 0 ]; then
        log "代码不完整，缺少: ${missing[*]}（请重新上传后重试）" "ERROR"; exit 1
    fi
    log "✅ 代码完整性检查通过" "SUCCESS"
}

build_frontend() {
    # 前端产物挂载给 nginx，需在宿主机构建（纯 JS 工程用 pnpm/npm）
    if [ ! -d "${FRONTEND_DIR}" ]; then
        log "跳过前端构建（无 frontend/web 目录）" "WARN"; return
    fi
    if [ "${SKIP_FRONTEND_BUILD:-0}" = "1" ]; then
        log "按 SKIP_FRONTEND_BUILD=1 跳过前端构建" "WARN"; return
    fi
    local pm
    if command -v pnpm &>/dev/null; then pm="pnpm"
    elif command -v npm &>/dev/null; then pm="npm"
    else log "未找到 pnpm/npm，无法构建前端" "ERROR"; exit 1
    fi
    log "构建前端（${pm}）..."
    cd "${FRONTEND_DIR}"
    if [ ! -d node_modules ] && [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
        ${pm} install || { log "前端依赖安装失败" "ERROR"; exit 1; }
    fi
    ${pm} build || { log "前端构建失败" "ERROR"; exit 1; }
    [ -d "${FRONTEND_DIR}/dist" ] || { log "未生成 dist 目录" "ERROR"; exit 1; }
    log "✅ 前端构建完成" "SUCCESS"
}

build_image() {
    cd "${DOCKER_DIR}"
    export DOCKER_BUILDKIT=1
    compose build backend || { log "后端镜像构建失败" "ERROR"; exit 1; }
    log "✅ 镜像构建完成" "SUCCESS"
}

start_service() {
    cd "${DOCKER_DIR}"
    compose up -d --force-recreate || { log "容器启动失败" "ERROR"; exit 1; }
    log "⏳ 等待 MySQL 就绪..."
    for i in $(seq 1 45); do
        if compose ps mysql --format '{{.Status}}' 2>/dev/null | grep -q "healthy"; then
            log "✅ MySQL 已就绪" "SUCCESS"; break
        fi
        sleep 2
    done
    compose ps
    log "✅ 服务启动完成" "SUCCESS"
}

stop_service() {
    cd "${DOCKER_DIR}" 2>/dev/null || true
    compose down 2>/dev/null || true
    log "✅ 服务已停止" "SUCCESS"
}

show_logs() {
    cd "${DOCKER_DIR}"
    compose ps --format "table {{.Service}}\t{{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo "--- 最近 50 行日志 ---"
    compose logs --tail=50 2>/dev/null
}

verify() {
    local ok=true
    for svc in mysql redis backend nginx; do
        local st
        st=$(cd "${DOCKER_DIR}" && compose ps "$svc" --format '{{.Status}}' 2>/dev/null || echo "not found")
        if echo "$st" | grep -qE "Up|healthy"; then
            log "✅ $svc: $st" "SUCCESS"
        else
            log "❌ $svc: $st" "ERROR"; ok=false
        fi
    done
    $ok && log "✅ 所有服务正常，访问 http://<服务器IP>:${HTTP_PORT:-80}/web/" "SUCCESS" \
        || log "⚠️ 部分服务异常，请执行 ./deploy.sh logs 排查" "WARN"
}

cleanup() {
    # 仅清理悬空镜像/构建缓存；不加 -a，避免误删服务器上其他项目的未使用镜像
    docker image prune -f >/dev/null 2>&1 || true
    docker builder prune -f >/dev/null 2>&1 || true
    log "✅ 构建缓存已清理" "SUCCESS"
}

# ==================== 主流程 ====================

full_deploy() {
    log "========== 🚀 开始完整部署 ${PROJECT_NAME} ==========" "INFO"
    log "时间: $(date '+%Y-%m-%d %H:%M:%S')"
    load_env
    check_deps
    check_code
    build_frontend
    build_image
    start_service
    verify
    show_logs
    cleanup
    log "========== 🎉 部署完成 ==========" "SUCCESS"
}

trap 'stop_service; exit 130' INT TERM

cd "${WORK_DIR}"
case ${1:-} in
    start)   load_env; start_service ;;
    stop)    load_env; stop_service ;;
    restart) load_env; cd "${DOCKER_DIR}"; compose restart; compose ps ;;
    logs)    load_env; show_logs ;;
    verify)  load_env; verify ;;
    clean)   cleanup ;;
    build)   load_env; check_code; build_frontend; build_image ;;
    help|-h|--help)
        echo "用法: $0 [命令]"
        echo "  无参数    完整部署（校验→构建前端→构建镜像→启动→验证；代码需先上传至服务器）"
        echo "  build     仅构建（前端产物 + 后端镜像），不启动"
        echo "  start     启动服务"
        echo "  stop      停止服务"
        echo "  restart   重启服务"
        echo "  logs      查看日志"
        echo "  verify    验证服务"
        echo "  clean     清理构建缓存"
        ;;
    *) full_deploy "$@" ;;
esac

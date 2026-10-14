# QuickAdmin 后端镜像
# 构建上下文为仓库根目录（compose 里 context: ../），故路径以 backend/ 开头
FROM python:3.12-slim

LABEL maintainer="quick-admin"

# 时区
ENV TZ=Asia/Shanghai

# uv 负责依赖安装（项目用 pyproject.toml + uv.lock 管理，无 requirements.txt）
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /home

# 先复制依赖清单并安装，代码变更时不重装依赖（层缓存）
# --no-install-project：仅装第三方依赖，不把项目自身作为包构建
# --frozen：严格按 uv.lock 安装
COPY ./backend/pyproject.toml ./backend/uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# 复制应用代码（.venv / logs / __pycache__ 等由根 .dockerignore 排除）
COPY ./backend/ .

# 让容器使用已安装依赖的虚拟环境
ENV PATH="/home/.venv/bin:$PATH"

EXPOSE 8001

# ENVIRONMENT / 连接配置由 compose environment 注入；默认读 env/.env.prod
CMD ["python", "main.py"]

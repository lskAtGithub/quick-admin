# 路径常量

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_DIR = BASE_DIR / "env"
LOG_DIR = BASE_DIR / "logs"
STATIC_DIR = BASE_DIR / "static"

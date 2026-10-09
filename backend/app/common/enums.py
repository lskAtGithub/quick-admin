from enum import Enum


class RET(Enum):
    """业务返回码"""
    OK = (0, '成功')
    ERROR = (1, '请求错误')
    UNAUTHORIZED = (401, '未授权')
    FORBIDDEN = (403, '禁止访问')
    NOT_FOUND = (404, '资源未找到')
    EXCEPTION = (500, '服务器错误')
    TOKEN_EXPIRE = (10401, 'token过期')
    NO_PERMISSION = (10403, '无权限操作')

    def __init__(self, code: int, msg: str):
        self._code = code
        self._msg = msg

    @property
    def code(self) -> int:
        return self._code

    @property
    def msg(self) -> str:
        return self._msg


class RedisInitKeyConfig(Enum):
    """Redis 键名前缀"""
    ACCESS_TOKEN = {"key": "access_token", "remark": "访问令牌"}
    REFRESH_TOKEN = {"key": "refresh_token", "remark": "刷新令牌"}
    USER_SESSION = {"key": "user_session", "remark": "用户会话"}

    @property
    def key(self) -> str:
        return self.value.get("key", "")

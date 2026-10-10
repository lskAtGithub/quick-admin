import bcrypt


class PwdUtil:
    @staticmethod
    def hash_password(password: str) -> str:
        """明文密码 → bcrypt 哈希"""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证明文密码是否匹配哈希"""
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

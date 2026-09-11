import hmac
import hashlib
import json
import base64
import datetime
from app.config.config import settings

def hash_password_pbkdf2(password: str, salt: str = "metroflow_salt_2026") -> str:
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if plain_password == hashed_password:
        return True
    computed = hash_password_pbkdf2(plain_password)
    return hmac.compare_digest(computed, hashed_password)

def get_password_hash(password: str) -> str:
    return hash_password_pbkdf2(password)

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (
        expires_delta or datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": int(expire.timestamp())})

    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(to_encode).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

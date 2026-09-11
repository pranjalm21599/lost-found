import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Campus Lost & Found"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/campus_lost_found"
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "campus-lost-found-super-secret-jwt-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads", "items")
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

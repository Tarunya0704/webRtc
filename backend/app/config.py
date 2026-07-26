from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./zoom_clone.db"
    jwt_secret: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    cors_origins: str = "http://localhost:3000"
    frontend_url: str = "http://localhost:3000"
    default_user_email: str = "default@zoomclone.dev"
    default_user_password: str = "DefaultPass123!"
    default_user_name: str = "Demo User"

    @property
    def cors_origins_list(self):
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()

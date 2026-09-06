from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Bilateral Translation AI API"
    api_version: str = "1.0.0"
    
    # Hugging Face config
    hf_repo_id: str
    hf_filename: str = "model.h5"
    
    # Optional local override
    model_path: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

settings = Settings()

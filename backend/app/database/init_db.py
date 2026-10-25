import logging
from app.database.database import engine, Base
from app.database import models

logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
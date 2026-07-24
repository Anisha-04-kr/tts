"""
Centralized logging system for the Local AI Voice Assistant backend.

Handles console and rotating file logging to local `logs/backend.log`.
"""

import sys
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE_PATH = LOGS_DIR / "backend.log"

def setup_logger(name: str = "LocalVoiceAssistant", log_level: str = "INFO") -> logging.Logger:
    """
    Configures and returns a logger instance with console and rotating file handlers.
    """
    logger = logging.getLogger(name)
    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    # Avoid duplicate handlers if already initialized
    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] [%(filename)s:%(lineno)d]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Rotating File Handler (Max 10MB per file, max 5 backup files)
    file_handler = RotatingFileHandler(
        filename=LOG_FILE_PATH,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

# Global default logger instance
logger = setup_logger()

def log_event(event_type: str, details: str, level: str = "info") -> None:
    """
    Helper function to log structured event activities (e.g. startup, health check, AI model actions).
    """
    log_msg = f"[{event_type.upper()}] {details}"
    log_func = getattr(logger, level.lower(), logger.info)
    log_func(log_msg)

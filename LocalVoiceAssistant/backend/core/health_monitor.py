"""
Health Monitor core service for performing system-wide health checks and operational diagnostic snapshots.
"""

import shutil
from typing import Dict, Any
from datetime import datetime, timezone
from backend.config.settings import settings
from backend.config.runtime import runtime_state
from backend.core.gpu_manager import gpu_manager
from backend.logger import logger, log_event

class HealthMonitor:
    """Aggregates health diagnostics across all backend services, hardware, and disk storage."""

    async def check_health(self) -> Dict[str, Any]:
        """
        Executes a comprehensive health check across runtime, services, GPU, and disk resources.
        """
        log_event("health", "Running system-wide health check...")

        # System disk health check
        disk_usage = shutil.disk_usage(str(settings.ROOT_DIR))
        free_gb = round(disk_usage.free / (1024 ** 3), 2)
        total_gb = round(disk_usage.total / (1024 ** 3), 2)
        disk_status = "ok" if free_gb > 1.0 else "warning"

        gpu_status = gpu_manager.get_status_dict()
        snapshot = runtime_state.snapshot()

        overall_status = "healthy"
        if disk_status != "ok" or any(s == "error" for s in snapshot["services_status"].values()):
            overall_status = "degraded"

        health_data = {
            "status": overall_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime_seconds": snapshot["uptime_seconds"],
            "services": snapshot["services_status"],
            "active_models": snapshot["active_models"],
            "disk": {
                "status": disk_status,
                "free_gb": free_gb,
                "total_gb": total_gb,
            },
            "gpu": {
                "is_available": gpu_status.get("cuda_available", gpu_status.get("is_available", False)),
                "device_name": gpu_status.get("gpu_name", "NVIDIA GPU Placeholder"),
                "free_vram_gb": gpu_status.get("free_vram_gb", 0.0),
            }
        }

        log_event("health", f"Health check completed. Overall status: {overall_status.upper()}")
        return health_data

# Global singleton HealthMonitor
health_monitor = HealthMonitor()

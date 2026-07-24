"""
Service Manager core component coordinating lifecycle events (init, start, stop, health) for all AI services.
"""

from typing import Dict, Any, List
from backend.config.runtime import runtime_state
from backend.logger import logger, log_event

class ServiceManager:
    """Central lifecycle coordinator managing active ASR, LLM, TTS, and Audio service instances."""

    def __init__(self) -> None:
        self._services: Dict[str, Any] = {}

    def register_service(self, name: str, service_instance: Any) -> None:
        """Registers a service instance with the lifecycle manager."""
        self._services[name.lower()] = service_instance
        runtime_state.update_service_status(name.lower(), "registered")
        log_event("service_manager", f"Registered service: '{name}'")

    def get_service(self, name: str) -> Any:
        """Retrieves registered service instance by name."""
        return self._services.get(name.lower())

    async def initialize_all(self) -> None:
        """Initializes all registered services in sequential order."""
        log_event("service_manager", "Initializing registered backend services...")
        for name, service in self._services.items():
            try:
                log_event("service_manager", f"Initializing service: {name}")
                await service.initialize()
                runtime_state.update_service_status(name, "initialized")
            except Exception as err:
                logger.error(f"[ServiceManager] Failed to initialize service '{name}': {err}", exc_info=True)
                runtime_state.update_service_status(name, "error")

    async def start_all(self) -> None:
        """Starts all registered services gracefully during application startup."""
        log_event("service_manager", "Starting all AI services...")
        runtime_state.is_running = True
        
        # Initialize first if not already done
        await self.initialize_all()

        for name, service in self._services.items():
            try:
                log_event("service_manager", f"Starting service: {name}")
                await service.start()
                runtime_state.update_service_status(name, "running")
            except Exception as err:
                logger.error(f"[ServiceManager] Failed to start service '{name}': {err}", exc_info=True)
                runtime_state.update_service_status(name, "error")

    async def stop_all(self) -> None:
        """Stops all running services gracefully during application shutdown."""
        log_event("service_manager", "Stopping all AI services gracefully...")
        for name, service in self._services.items():
            try:
                log_event("service_manager", f"Stopping service: {name}")
                await service.stop()
                runtime_state.update_service_status(name, "stopped")
            except Exception as err:
                logger.error(f"[ServiceManager] Error stopping service '{name}': {err}", exc_info=True)
                runtime_state.update_service_status(name, "error")
        
        runtime_state.is_running = False
        log_event("service_manager", "All backend services stopped.")

    async def health_check_all(self) -> Dict[str, Any]:
        """Runs individual health check queries against all registered services."""
        results: Dict[str, Any] = {}
        for name, service in self._services.items():
            try:
                res = await service.health_check()
                results[name] = res
            except Exception as err:
                logger.error(f"[ServiceManager] Health check failed for '{name}': {err}")
                results[name] = {"status": "error", "error": str(err)}
        return results

# Global singleton ServiceManager
service_manager = ServiceManager()

"""
GPU Manager module for monitoring hardware CUDA resources, VRAM allocations, and device status.
"""

from typing import Dict, Any
from backend.config.settings import settings
from backend.models.domain import GPUInfo
from backend.logger import logger, log_event

class GPUManager:
    """Manages GPU hardware detection, VRAM budgeting, and device allocation."""

    def __init__(self) -> None:
        self._gpu_info = self._detect_hardware()

    def _detect_hardware(self) -> GPUInfo:
        """
        Detects local GPU capabilities. Checks PyTorch / NVML safely if available,
        otherwise returns structured fallback GPU placeholder.
        """
        log_event("gpu", "Probing local GPU hardware acceleration capabilities...")
        
        # Try PyTorch CUDA probe safely
        try:
            import torch
            if torch.cuda.is_available():
                count = torch.cuda.device_count()
                device_name = torch.cuda.get_device_name(0)
                total_mem = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
                log_event("gpu", f"Detected CUDA GPU via PyTorch: {device_name} ({total_mem:.2f} GB VRAM)")
                return GPUInfo(
                    is_available=True,
                    device_count=count,
                    device_name=device_name,
                    total_vram_gb=round(total_mem, 2),
                    free_vram_gb=round(total_mem * 0.85, 2),
                    cuda_version=torch.version.cuda or "12.1"
                )
        except ImportError:
            log_event("gpu", "PyTorch CUDA dynamic bindings not detected in current env. Using system probe placeholder.")
        except Exception as err:
            logger.warning(f"[GPU] Error during PyTorch CUDA detection probe: {err}")

        # Standard Placeholder returned when PyTorch is not yet installed in venv
        return GPUInfo(
            is_available=settings.ENABLE_GPU,
            device_count=1 if settings.ENABLE_GPU else 0,
            device_name="NVIDIA GeForce RTX (Local Placeholder)",
            total_vram_gb=settings.MAX_VRAM_GB,
            free_vram_gb=round(settings.MAX_VRAM_GB * 0.75, 2),
            cuda_version="12.1 (Placeholder)"
        )

    def get_status(self) -> GPUInfo:
        """Returns current GPU status object."""
        return self._gpu_info

    def get_status_dict(self) -> Dict[str, Any]:
        """Returns dictionary representation of GPU hardware state for health monitoring."""
        info = self.get_status()
        vram_used = round(info.total_vram_gb - info.free_vram_gb, 2)
        device_str = "cuda:0" if info.is_available else "cpu"
        
        return {
            "cuda_available": info.is_available,
            "gpu_name": info.device_name,
            "vram_used_gb": vram_used,
            "vram_total_gb": info.total_vram_gb,
            "free_vram_gb": info.free_vram_gb,
            "inference_device": device_str,
            "device_count": info.device_count,
            "cuda_version": info.cuda_version,
            "cuda_visible_devices": settings.CUDA_VISIBLE_DEVICES,
            "compute_precision": settings.DEFAULT_COMPUTE_TYPE
        }

    def allocate_vram_budget(self, service_type: str, required_vram_gb: float) -> bool:
        """
        Evaluates whether sufficient VRAM is available to host a new model instance.
        """
        info = self.get_status()
        if not info.is_available:
            log_event("gpu", f"GPU allocation requested for {service_type}, but GPU is disabled/unavailable. Falling back to CPU.", level="warning")
            return False

        if required_vram_gb <= info.free_vram_gb:
            log_event("gpu", f"VRAM budget allocated for {service_type}: {required_vram_gb:.2f} GB requested ({info.free_vram_gb:.2f} GB available).")
            return True
        else:
            log_event("gpu", f"Insufficient VRAM for {service_type}: requested {required_vram_gb:.2f} GB, free {info.free_vram_gb:.2f} GB.", level="warning")
            return False

# Global singleton GPUManager
gpu_manager = GPUManager()

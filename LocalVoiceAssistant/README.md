# Local AI Voice Assistant - Phase 3 Backend Infrastructure

Foundational backend architecture for a 100% local, privacy-first AI Voice Assistant running on Windows with **Phase 3 Local Text-to-Speech Service (Fish Speech S2 Pro + vLLM-Omni)**.

> [!NOTE]
> All services remain **100% offline**. No cloud APIs (OpenAI, Gemini, ElevenLabs, HuggingFace, Replicate) are used. Everything runs on localhost (`127.0.0.1`).

---

## 📁 Project Architecture & Phase 3 Structure

```text
LocalVoiceAssistant/
│
├── backend/
│   ├── api/
│   │   ├── router.py                  # Master API router aggregating /api/v1 endpoints
│   │   └── v1/
│   │       ├── tts.py                 # POST /synthesize, GET /health, GET /models, POST /restart, POST /stop
│   │       ├── health.py              # GET /api/v1/health & GET /health
│   │       ├── status.py              # GET /api/v1/status & GET /status
│   │       ├── config.py              # GET /api/v1/config & GET /config
│   │       ├── llm.py                 # POST /api/v1/llm/generate & POST /api/v1/llm/stream
│   │       ├── asr.py                 # POST /api/v1/asr/transcribe
│   │       ├── models.py              # GET/POST /api/v1/models (Model Registry & switching)
│   │       ├── settings.py            # GET/POST /api/v1/settings
│   │       ├── audio.py               # GET /api/v1/audio/devices
│   │       └── websocket.py           # WS /api/v1/ws/audio-stream
│   ├── clients/                       # Local HTTP client layer
│   │   └── tts_client.py              # Connects to configurable vLLM-Omni Speech API (settings.TTS_ENDPOINT)
│   ├── core/                          # System infrastructure components
│   │   ├── gpu_manager.py             # CUDA / VRAM hardware probe (cuda_available, gpu_name, vram_used_gb, etc.)
│   │   ├── health_monitor.py          # Comprehensive health monitor
│   │   └── service_manager.py         # Lifecycle coordinator for active services
│   ├── registry/
│   │   └── model_registry.py          # ModelRegistry managing fish-speech-s2-pro
│   ├── services/                      # Abstract service providers
│   │   └── tts/
│   │       ├── base.py                # BaseTTSService with restart_service() interface
│   │       └── fishspeech.py          # FishSpeechTTSService with startup model file validation
│   ├── config/
│   │   ├── settings.py                # Pydantic Settings (TTS_ENDPOINT, DEFAULT_SPEAKER, VOICE_CLONING_ENABLED)
│   │   └── runtime.py                 # Dynamic runtime state & TTS synthesis statistics
│   ├── schemas/
│   │   └── requests_responses.py      # Pydantic DTOs (TTSRequest, TTSResponse, TTSHealthResponse)
│   ├── logger.py                      # Console & rotating file logger (logs/backend.log)
│   ├── main.py                        # FastAPI entrypoint with Lifespan async handlers
│   └── requirements.txt               # Backend Python dependencies
│
├── frontend/                          # Reserved folder for future Next.js app
├── models/                            # Managed local AI model weight directories
│   ├── fishspeech/
│   │   └── fish-speech-s2-pro/        # Directory containing Fish Speech S2 Pro weights
│   ├── whisper/
│   ├── llm/
│   ├── voices/                        # Reference voice cloning audio profiles
│   ├── cache/
│   ├── downloads/
│   └── embeddings/
├── scripts/                           # Windows PowerShell automation scripts
│   ├── setup_venv.ps1                 # Create virtual environment & install backend requirements
│   ├── run_backend.ps1                 # Start backend Uvicorn server
│   ├── test_backend.ps1                # Run backend test suite via pytest
│   ├── start_fishspeech.ps1           # Start local vLLM-Omni Fish Speech server
│   ├── stop_fishspeech.ps1            # Terminate vLLM-Omni server process
│   ├── restart_fishspeech.ps1         # Restart vLLM-Omni server process
│   └── sample_tts_request.py          # Sample Python script for testing synthesis requests
├── logs/                              # Application runtime logs (logs/backend.log)
├── temp/                              # Temporary runtime files
├── config/                            # Environment configuration files (.env, .env.example)
└── README.md                          # Documentation
```

---

## 🔊 Phase 3 Local TTS (Fish Speech S2 Pro + vLLM-Omni) Features

1. **Flexible Voice Management**: Replaced hardcoded voices with `DEFAULT_SPEAKER = "default"`, `VOICE_REFERENCE_DIRECTORY = "models/voices/"`, and `VOICE_CLONING_ENABLED = True`.
2. **Automatic Multi-Language Support**: `LANGUAGE_VALIDATION = False`. Accepts any valid UTF-8 string; Fish Speech detects language automatically.
3. **Direct Binary Audio Output**: `POST /api/v1/tts/synthesize` returns direct binary `audio/wav` bytes by default. JSON is only returned if `return_json=true` query/body parameter or `Accept: application/json` is set.
4. **No Fake Audio**: If local vLLM-Omni server is offline, returns HTTP 503 JSON:
   ```json
   {
     "status": "offline",
     "message": "Fish Speech server is unavailable."
   }
   ```
5. **Configurable Endpoint Path**: Target endpoint path configured via `settings.TTS_ENDPOINT` (`http://127.0.0.1:8002/v1/audio/speech`).
6. **Service Lifecycle**: Supports `restart_service()` via `POST /api/v1/tts/restart`.
7. **Detailed Health Diagnostics**: `GET /api/v1/tts/health` verifies model file existence, vLLM-Omni reachability, version info (`fish_speech_version`, `vllm_version`), and GPU hardware metrics (`cuda_available`, `gpu_name`, `vram_used_gb`, `vram_total_gb`, `inference_device`).
8. **Startup Model Validation**: Validates presence of model directory, weights (`.pth`/`.safetensors`), tokenizer (`tokenizer.json`), and config (`config.json`).
9. **Process Management Scripts**: PowerShell scripts provided under `scripts/` (`start_fishspeech.ps1`, `stop_fishspeech.ps1`, `restart_fishspeech.ps1`).

---

## 🛠️ How to Run the Local TTS Service

### 1. Setup Virtual Environment
```powershell
.\scripts\setup_venv.ps1
```

### 2. Manual Fish Speech & vLLM-Omni Server Setup (User Action)
Place your Fish Speech S2 Pro model weights inside:
`models/fishspeech/fish-speech-s2-pro/`

Start the vLLM-Omni server:
```powershell
.\scripts\start_fishspeech.ps1
```

### 3. Run Backend Server
```powershell
.\scripts\run_backend.ps1
```

---

## 📡 API Endpoints

### 1. Synthesize Speech (`POST /api/v1/tts/synthesize`)
**Request Body:**
```json
{
  "text": "Hello, this is a local voice synthesis test using Fish Speech S2 Pro.",
  "speaker": "default",
  "speed": 1.0,
  "pitch": 0.0,
  "sample_rate": 24000,
  "output_format": "wav"
}
```
**Response:** Binary `audio/wav` content stream.

---

### 2. TTS Health Diagnostic (`GET /api/v1/tts/health`)
**Response:**
```json
{
  "status": "healthy",
  "fish_speech_version": "1.5 S2 Pro",
  "vllm_version": "vllm-omni-0.4.0",
  "model_path": "c:\\Users\\...\\models\\fishspeech\\fish-speech-s2-pro",
  "model_loaded": true,
  "vllm_omni_reachable": true,
  "running_since": "2026-07-23T18:00:00.000000+00:00",
  "gpu": {
    "cuda_available": true,
    "gpu_name": "NVIDIA GeForce RTX",
    "vram_used_gb": 1.2,
    "vram_total_gb": 8.0,
    "inference_device": "cuda:0"
  }
}
```

---

### 3. Restart TTS Service (`POST /api/v1/tts/restart`)
Rebinds client connections and re-probes local vLLM-Omni server.

---

## 🧪 Run Tests

Execute unit and integration test suite:
```powershell
.\scripts\test_backend.ps1
```

Execute sample TTS request script:
```powershell
python scripts/sample_tts_request.py
```

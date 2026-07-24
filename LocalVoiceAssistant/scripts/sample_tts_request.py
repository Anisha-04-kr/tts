"""
Sample request script demonstrating how to interact with the Local TTS Service API (/api/v1/tts/synthesize).
"""

import sys
import json
import httpx

BACKEND_URL = "http://127.0.0.1:8000"

def run_sample_synthesis():
    print("==================================================")
    print("Local AI Voice Assistant - Sample TTS Request")
    print("==================================================")

    # 1. Health Probe
    try:
        health_res = httpx.get(f"{BACKEND_URL}/api/v1/tts/health", timeout=5.0)
        print(f"\n[1] GET /api/v1/tts/health -> HTTP {health_res.status_code}")
        print(json.dumps(health_res.json(), indent=2))
    except Exception as err:
        print(f"Error querying TTS health endpoint: {err}")
        return

    # 2. Synthesis Request
    payload = {
        "text": "Hello! This is a test of the local Fish Speech S2 Pro text to speech service.",
        "speaker": "default",
        "speed": 1.0,
        "pitch": 0.0,
        "sample_rate": 24000,
        "output_format": "wav",
        "return_json": False
    }

    print(f"\n[2] POST /api/v1/tts/synthesize...")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = httpx.post(f"{BACKEND_URL}/api/v1/tts/synthesize", json=payload, timeout=10.0)
        print(f"Response Code: HTTP {response.status_code}")

        if response.status_code == 200:
            print(f"Received binary audio payload ({len(response.content)} bytes)")
            output_file = "temp/sample_output.wav"
            with open(output_file, "wb") as f:
                f.write(response.content)
            print(f"Saved output audio to: {output_file}")
        else:
            print("Response Body:")
            print(json.dumps(response.json(), indent=2))
    except Exception as err:
        print(f"Error executing synthesis request: {err}")

if __name__ == "__main__":
    run_sample_synthesis()

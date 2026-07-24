"""
LM Studio LLM Client Adapter for local OpenAI-compatible inference engine.
"""

import json
from typing import Dict, Any, List, AsyncGenerator, Optional
import httpx
from backend.config.settings import settings
from backend.logger import logger, log_event

class LMStudioAdapter:
    """Adapter interface communicating with local LM Studio server (configurable endpoint)."""

    def __init__(self, endpoint: Optional[str] = None, timeout: float = 30.0) -> None:
        self.endpoint = endpoint or settings.LOCAL_LMSTUDIO_ENDPOINT
        self.timeout = timeout
        log_event("lmstudio_adapter", f"Initialized LMStudioAdapter targeting local endpoint: {self.endpoint}")

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> Dict[str, Any]:
        """
        Sends formatted chat conversation history to LM Studio `/chat/completions` API.
        """
        log_event("lmstudio_adapter", f"Sending completion request ({len(messages)} messages) to {self.endpoint}...")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self.endpoint}/chat/completions",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return {
                        "text": content,
                        "tokens_generated": data.get("usage", {}).get("completion_tokens", len(content.split())),
                        "model_used": model,
                        "provider_used": "lmstudio",
                        "mock": False
                    }
        except httpx.ConnectError:
            log_event("lmstudio_adapter", f"Local LM Studio engine at {self.endpoint} is offline. Using fallback response.", level="warning")
        except Exception as err:
            logger.error(f"[LMStudioAdapter] Error contacting LM Studio: {err}")

        # Fallback response when local engine server is offline
        last_user_msg = messages[-1]["content"] if messages else ""
        
        # Build intelligent offline clinical AI response generator
        msg_lower = last_user_msg.lower()

        if "headache" in msg_lower or "head pain" in msg_lower or "cephalgia" in msg_lower:
            mock_text = (
                "### Clinical Guidance: Medical Evaluation for Headache\n\n"
                "**1. Potential Causes & Types:**\n"
                "- **Tension Headache**: Most common, presenting as a dull, tight band-like pain around the head.\n"
                "- **Migraine**: Throbbing, often unilateral pain associated with sensitivity to light/sound and nausea.\n"
                "- **Sinus / Hypertensive**: Related to nasal congestion or acute blood pressure spikes.\n\n"
                "**2. Immediate Home Care & Relief Measures:**\n"
                "- Rest in a quiet, darkened, well-ventilated room.\n"
                "- Stay hydrated with water; apply a cold compress to the forehead or warm wrap to the neck.\n"
                "- Over-the-counter pain relievers (e.g., Acetaminophen / Paracetamol 500mg, or Ibuprofen 200-400mg) if medically appropriate and not contraindicated.\n\n"
                "**3. Red Flag Warnings (Seek Immediate Medical Care):**\n"
                "- Sudden, severe 'thunderclap' headache.\n"
                "- Headache accompanied by high fever, stiff neck, confusion, numbness, visual disturbances, or speech difficulty."
            )
        elif "hypertension" in msg_lower or "high blood pressure" in msg_lower or "high bp" in msg_lower:
            mock_text = (
                "### Clinical Guide: Symptoms & Management of Hypertension\n\n"
                "**1. Clinical Overview & Symptoms:**\n"
                "- Hypertension is frequently called a **'silent killer'** because Stage 1 & 2 hypertension often produce no obvious symptoms.\n"
                "- Severe or hypertensive crises (BP > 180/120 mmHg) may cause **headaches**, **dizziness**, **shortness of breath**, **blurred vision**, or **chest tightness**.\n\n"
                "**2. Blood Pressure Categories:**\n"
                "- **Normal**: Systolic < 120 and Diastolic < 80 mmHg\n"
                "- **Elevated**: Systolic 120-129 and Diastolic < 80 mmHg\n"
                "- **Stage 1 Hypertension**: Systolic 130-139 or Diastolic 80-89 mmHg\n"
                "- **Stage 2 Hypertension**: Systolic ≥ 140 or Diastolic ≥ 90 mmHg\n\n"
                "**3. Recommended Clinical Management:**\n"
                "- **Lifestyle Modifications**: Low-sodium DASH diet (< 2,300mg sodium/day), regular aerobic exercise (150 min/week), weight management, limiting alcohol.\n"
                "- **Pharmacotherapy**: Physician-prescribed medications (e.g., ACE Inhibitors like Lisinopril, ARBs, Calcium Channel Blockers, or Thiazide Diuretics)."
            )
        elif "chest pain" in msg_lower or "angina" in msg_lower or "heart attack" in msg_lower:
            mock_text = (
                "### 🚨 URGENT CLINICAL WARNING: Chest Pain Evaluation\n\n"
                "**Chest pain requires immediate medical evaluation to rule out Acute Coronary Syndrome (Myocardial Infarction).**\n\n"
                "**Key Warning Symptoms:**\n"
                "- Squeezing, pressure, or tightness in the center/left chest radiating to left arm, neck, jaw, or back.\n"
                "- Accompanied by cold sweating (diaphoresis), shortness of breath, dizziness, or severe nausea.\n\n"
                "**Immediate Action Required:**\n"
                "1. **Call Emergency Services immediately** (911 or local emergency phone number).\n"
                "2. Sit down, remain calm, and chew an Aspirin (325mg) if advised by emergency responders."
            )
        elif "fever" in msg_lower or "temperature" in msg_lower or "chills" in msg_lower or "pyrexia" in msg_lower:
            mock_text = (
                "### Clinical Management of Fever\n\n"
                "**1. Overview & Causes:**\n"
                "- Fever (body temperature ≥ 100.4°F / 38.0°C) is a natural immune response to viral or bacterial infections (e.g., influenza, COVID-19, urinary tract infection, gastroenteritis).\n\n"
                "**2. Recommended Management:**\n"
                "- Stay well hydrated with water, oral rehydration salts, or clear fluids.\n"
                "- Antipyretics: Paracetamol / Acetaminophen (500mg - 1000mg) or Ibuprofen as directed by a healthcare professional.\n"
                "- Rest and wear lightweight clothing.\n\n"
                "**3. When to See a Doctor:**\n"
                "- Temperature > 103°F (39.4°C) or fever persisting for more than 3 consecutive days.\n"
                "- Accompanied by severe headache, stiff neck, shortness of breath, or rash."
            )
        elif "diabetes" in msg_lower or "blood sugar" in msg_lower or "glucose" in msg_lower:
            mock_text = (
                "### Clinical Guidance: Diabetes Mellitus & Glucose Control\n\n"
                "**1. Core Symptoms:**\n"
                "- **Hyperglycemia (High Blood Sugar)**: Frequent urination (polyuria), excessive thirst (polydipsia), unexplained weight loss, fatigue, blurred vision.\n"
                "- **Hypoglycemia (Low Blood Sugar < 70 mg/dL)**: Shakiness, sweating, rapid heart rate, confusion, dizziness.\n\n"
                "**2. Target Blood Glucose Levels (ADA Guidelines):**\n"
                "- Fasting Glucose: 80 - 130 mg/dL\n"
                "- Post-Meal (2 hrs after eating): < 180 mg/dL\n"
                "- Target HbA1c: < 7.0%\n\n"
                "**3. Management Strategy:**\n"
                "- Consistent carbohydrate monitoring, daily physical activity, blood glucose logbook, and prescribed therapy (Insulin or oral hypoglycemics like Metformin)."
            )
        elif "cough" in msg_lower or "asthma" in msg_lower or "breath" in msg_lower or "shortness of breath" in msg_lower:
            mock_text = (
                "### Respiratory Symptoms Assessment\n\n"
                "**1. Clinical Evaluation:**\n"
                "- Shortness of breath (dyspnea), wheezing, or persistent cough may indicate asthma, bronchitis, pneumonia, allergies, or COPD.\n\n"
                "**2. Immediate Care Instructions:**\n"
                "- Sit upright to assist lung expansion; stay calm and take slow, deep breaths.\n"
                "- Use prescribed rescue inhalers (e.g., Albuterol / Salbutamol) if diagnosed with asthma.\n\n"
                "**3. Urgent Warning Symptoms:**\n"
                "- Inability to speak full sentences, bluish tint to lips/nails (cyanosis), or severe chest tightness require immediate emergency care."
            )
        elif "soap" in msg_lower or "transcript" in msg_lower:
            mock_text = (
                "### Clinical SOAP Note Summary (Local AI Assistant)\n\n"
                "**SUBJECTIVE:** Patient presents with reported symptoms for clinical evaluation.\n"
                "**OBJECTIVE:** Vital signs stable. Physical exam reveals no acute distress.\n"
                "**ASSESSMENT:** Primary symptoms monitored; clinical diagnostic workup recommended.\n"
                "**PLAN:** Continue prescribed regimen, schedule follow-up encounter, and monitor progress."
            )
        elif "icd" in msg_lower or "code" in msg_lower:
            mock_text = (
                "### ICD-10 Diagnostic Coding Guidance\n\n"
                "Common diagnostic categories:\n"
                "- **I10**: Essential (primary) hypertension\n"
                "- **E11.9**: Type 2 diabetes mellitus without complications\n"
                "- **R50.9**: Fever, unspecified\n"
                "- **R07.9**: Chest pain, unspecified\n"
                "- **G43.909**: Migraine, unspecified"
            )
        elif "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
            mock_text = "Hello! I am your local AI Healthcare & Clinical Assistant running fully offline. How can I assist you with clinical notes, medical definitions, symptoms, or diagnostic coding today?"
        else:
            mock_text = (
                f"### Healthcare AI Assistant Clinical Response\n\n"
                f"**Clinical Query:** *\"{last_user_msg}\"*\n\n"
                f"1. **Medical Overview**: Your query touches upon important health parameters. Clinical management requires evaluating symptoms, underlying medical history, and relevant vital signs.\n"
                f"2. **Diagnostic & Therapeutic Considerations**: Standard medical protocols emphasize confirming diagnosis through clinical examination and targeted laboratory workup.\n"
                f"3. **Clinical Recommendation**: Discuss your specific symptoms and medical history with a licensed healthcare physician for personalized diagnosis and treatment planning."
            )

        return {
            "text": mock_text,
            "tokens_generated": len(mock_text.split()),
            "model_used": model,
            "provider_used": "lmstudio_offline",
            "mock": True
        }



    async def stream_chat_tokens(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3-8b-local",
        temperature: float = 0.7,
        max_tokens: int = 256
    ) -> AsyncGenerator[str, None]:
        """
        Streams generated text tokens from LM Studio using SSE stream.
        """
        log_event("lmstudio_adapter", f"Initiating token stream from {self.endpoint}...")
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        contacted = False
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", f"{self.endpoint}/chat/completions", json=payload) as res:
                    if res.status_code == 200:
                        contacted = True
                        async for line in res.aiter_lines():
                            if line.startswith("data: ") and line != "data: [DONE]":
                                try:
                                    data = json.loads(line[6:])
                                    token = data["choices"][0]["delta"].get("content", "")
                                    if token:
                                        yield token
                                except Exception:
                                    pass
        except Exception as err:
            logger.warning(f"[LMStudioAdapter] Token streaming error: {err}")

        if not contacted:
            for word in ["LM ", "Studio ", "offline ", "stream ", "response."]:
                yield word

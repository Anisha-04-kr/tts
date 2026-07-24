"""
Medical Assistant Service providing clinical conversation transcription processing, SOAP note formatting,
ICD-10 diagnostic coding lookup, specialist referral letter drafting, and medical report summarization.
"""

from typing import Dict, Any, Optional, List
from backend.services.llm.lmstudio import LMStudioLLMService
from backend.logger import logger, log_event

class MedicalAssistantService:
    """Domain service for healthcare & clinical assistant capabilities using local LLM inference."""

    def __init__(self, llm_service: Optional[LMStudioLLMService] = None) -> None:
        self.llm_service = llm_service or LMStudioLLMService()
        log_event("medical_service", "Initialized MedicalAssistantService using local offline LLM.")

    async def generate_soap_note(self, transcript: str) -> Dict[str, Any]:
        """
        Processes a raw clinical conversation transcript and structures it into a formal SOAP Note:
        - Subjective (S)
        - Objective (O)
        - Assessment (A)
        - Plan (P)
        """
        log_event("medical_service", "Generating clinical SOAP note from transcript...")
        prompt = (
            "Analyze the following doctor-patient consultation transcript and format a professional SOAP Note:\n\n"
            f"TRANSCRIPT:\n{transcript}\n\n"
            "Format your response as:\n"
            "SUBJECTIVE:\n"
            "OBJECTIVE:\n"
            "ASSESSMENT:\n"
            "PLAN:\n"
        )
        sys_prompt = "You are an expert local AI Medical Scribe assisting clinicians with structured documentation."
        res = await self.llm_service.generate(prompt=prompt, system_prompt=sys_prompt, max_tokens=500)
        return {
            "soap_note": res.get("text", ""),
            "raw_transcript": transcript,
            "provider": res.get("provider_used", "lmstudio")
        }

    async def lookup_icd10(self, description: str) -> Dict[str, Any]:
        """
        Suggests relevant ICD-10 clinical diagnosis codes and descriptions based on symptom input.
        """
        log_event("medical_service", f"Performing ICD-10 diagnostic code lookup for: '{description[:30]}...'")
        prompt = (
            f"Identify potential ICD-10 diagnosis codes for the following symptom/clinical description:\n"
            f"'{description}'\n\n"
            "List code, official disease name, and brief description."
        )
        sys_prompt = "You are a local medical coding assistant specializing in ICD-10-CM codes."
        res = await self.llm_service.generate(prompt=prompt, system_prompt=sys_prompt, max_tokens=300)
        return {
            "icd10_results": res.get("text", ""),
            "query": description,
            "provider": res.get("provider_used", "lmstudio")
        }

    async def draft_referral_letter(
        self,
        patient_name: str,
        clinical_summary: str,
        specialist_type: str
    ) -> Dict[str, Any]:
        """
        Drafts a formal medical referral letter to a specialist.
        """
        log_event("medical_service", f"Drafting referral letter for patient '{patient_name}' to {specialist_type}...")
        prompt = (
            f"Draft a formal medical specialist referral letter:\n"
            f"Patient Name: {patient_name}\n"
            f"Target Specialist: {specialist_type}\n"
            f"Clinical Summary: {clinical_summary}\n\n"
            "Include formal salutation, background, current symptoms, requested consultation, and sign-off."
        )
        sys_prompt = "You are a clinical assistant drafting professional physician referral documentation."
        res = await self.llm_service.generate(prompt=prompt, system_prompt=sys_prompt, max_tokens=400)
        return {
            "referral_letter": res.get("text", ""),
            "patient_name": patient_name,
            "specialist_type": specialist_type,
            "provider": res.get("provider_used", "lmstudio")
        }

    async def summarize_medical_report(self, report_text: str) -> Dict[str, Any]:
        """
        Summarizes complex lab reports, discharge summaries, or imaging notes.
        """
        log_event("medical_service", "Summarizing medical report text...")
        prompt = (
            "Provide a clear, concise medical summary of the following clinical report, highlighting key findings, abnormal labs, and recommendations:\n\n"
            f"REPORT:\n{report_text}\n"
        )
        sys_prompt = "You are a local medical report summarization assistant."
        res = await self.llm_service.generate(prompt=prompt, system_prompt=sys_prompt, max_tokens=400)
        return {
            "summary": res.get("text", ""),
            "provider": res.get("provider_used", "lmstudio")
        }

# Singleton instance
medical_service = MedicalAssistantService()

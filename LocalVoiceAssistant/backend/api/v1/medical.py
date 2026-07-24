"""
FastAPI router for Medical Assistant endpoints (/api/v1/medical).
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from backend.services.medical.service import medical_service
from backend.logger import log_event

router = APIRouter(prefix="/medical", tags=["Medical Assistant"])

class SOAPRequest(BaseModel):
    transcript: str = Field(..., description="Doctor-patient clinical conversation transcript")

class ICD10Request(BaseModel):
    description: str = Field(..., description="Symptom or clinical description for ICD-10 lookup")

class ReferralRequest(BaseModel):
    patient_name: str = Field("John Doe", description="Patient name")
    clinical_summary: str = Field(..., description="Clinical history and reason for referral")
    specialist_type: str = Field("Cardiologist", description="Target medical specialist specialty")

class SummarizeReportRequest(BaseModel):
    report_text: str = Field(..., description="Raw text of medical report, lab result, or discharge note")

@router.post("/soap-note")
async def generate_soap_note(payload: SOAPRequest) -> Dict[str, Any]:
    """Generates structured SOAP clinical note from doctor-patient conversation transcript."""
    log_event("api", "Received POST /api/v1/medical/soap-note request")
    if not payload.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text cannot be empty.")
    return await medical_service.generate_soap_note(payload.transcript)

@router.post("/icd10-lookup")
async def lookup_icd10(payload: ICD10Request) -> Dict[str, Any]:
    """Extracts suggested ICD-10 diagnostic codes and descriptions from clinical symptoms."""
    log_event("api", f"Received POST /api/v1/medical/icd10-lookup request: '{payload.description[:30]}...'")
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Description text cannot be empty.")
    return await medical_service.lookup_icd10(payload.description)

@router.post("/referral-letter")
async def draft_referral_letter(payload: ReferralRequest) -> Dict[str, Any]:
    """Drafts a formal medical referral letter to a specialist."""
    log_event("api", f"Received POST /api/v1/medical/referral-letter request for '{payload.patient_name}'")
    return await medical_service.draft_referral_letter(
        patient_name=payload.patient_name,
        clinical_summary=payload.clinical_summary,
        specialist_type=payload.specialist_type
    )

@router.post("/summarize-report")
async def summarize_medical_report(payload: SummarizeReportRequest) -> Dict[str, Any]:
    """Summarizes complex medical reports, imaging notes, or lab results."""
    log_event("api", "Received POST /api/v1/medical/summarize-report request")
    if not payload.report_text.strip():
        raise HTTPException(status_code=400, detail="Report text cannot be empty.")
    return await medical_service.summarize_medical_report(payload.report_text)

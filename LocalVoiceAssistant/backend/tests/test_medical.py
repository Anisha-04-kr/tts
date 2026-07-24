"""
Automated unit tests for Medical Assistant services and endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.medical.service import medical_service

client = TestClient(app)

@pytest.mark.asyncio
async def test_medical_service_methods():
    """Verify MedicalAssistantService methods return structured clinical outputs."""
    soap = await medical_service.generate_soap_note("Patient has chest pain for 2 days.")
    assert "soap_note" in soap

    icd = await medical_service.lookup_icd10("Acute chest pain")
    assert "icd10_results" in icd

    referral = await medical_service.draft_referral_letter("Jane Doe", "Palpitations evaluation", "Cardiologist")
    assert "referral_letter" in referral

    summary = await medical_service.summarize_medical_report("CHEST X-RAY: Normal.")
    assert "summary" in summary

def test_medical_api_endpoints():
    """Verify POST /api/v1/medical/* endpoints."""
    res1 = client.post("/api/v1/medical/soap-note", json={"transcript": "Doctor consultation text..."})
    assert res1.status_code == 200

    res2 = client.post("/api/v1/medical/icd10-lookup", json={"description": "Shortness of breath"})
    assert res2.status_code == 200

    res3 = client.post("/api/v1/medical/referral-letter", json={
        "patient_name": "Test Patient",
        "clinical_summary": "Summary text",
        "specialist_type": "Neurologist"
    })
    assert res3.status_code == 200

    res4 = client.post("/api/v1/medical/summarize-report", json={"report_text": "MRI BRAIN: Unremarkable."})
    assert res4.status_code == 200

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports"])
report_service = ReportService()

@router.get("/{session_id}/pdf")
def download_pdf_report(session_id: str):
    # In production, query db.query(InterviewSession).filter_by(id=session_id)
    # and pass the actual DB record dictionary.
    mock_session_data = {
        "candidate_name": "Alex Mercer",
        "target_role": "Machine Learning Engineer",
        "category": "System Design",
        "overall_score": 85
    }
    
    file_name = f"report_{session_id}.pdf"
    file_path = report_service.generate_pdf_report(mock_session_data, file_name)
    
    return FileResponse(
        path=file_path,
        filename=f"Interview_Report_{session_id}.pdf",
        media_type="application/pdf"
    )
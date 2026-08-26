from fastapi import APIRouter, Query, HTTPException
from models.schemas import ForecastResponse
from services.prophet_service import get_forecast

router = APIRouter()

@router.get("/api/v1/forecast", response_model=ForecastResponse)
def predict_price(crop: str = Query(..., description="Name of the crop (e.g., Tomato)")):
    """
    Endpoint to predict the price of a crop for the next 7 days using Prophet.
    """
    try:
        forecast_result = get_forecast(crop_name=crop, days=7)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return ForecastResponse(
        crop_name=crop,
        forecast_trend=forecast_result["forecast_trend"],
        advisory_text=forecast_result["advisory_text"]
    )

from fastapi import APIRouter, HTTPException
from models.schemas import OptimizeRouteRequest, OptimizeRouteResponse
from services.ortools_service import calculate_optimal_route

router = APIRouter()

@router.post("/api/v1/optimize-route", response_model=OptimizeRouteResponse)
def optimize_route(request: OptimizeRouteRequest):
    """
    Endpoint to calculate the most fuel-efficient delivery route 
    for multiple farm pickups to a single buyer dropoff using Google OR-Tools.
    """
    try:
        result = calculate_optimal_route(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return OptimizeRouteResponse(
        total_distance_km=result["total_distance_km"],
        route_coordinates=result["route_coordinates"],
        ordered_stops=result["ordered_stops"]
    )

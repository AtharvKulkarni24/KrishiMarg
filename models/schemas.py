from pydantic import BaseModel
from typing import List, Optional

# --- PROPHET MODELS ---
class ForecastData(BaseModel):
    date: str
    price: float

class ForecastResponse(BaseModel):
    crop_name: str
    forecast_trend: List[ForecastData]
    advisory_text: str

# --- OR-TOOLS ROUTING MODELS ---
class PickupPoint(BaseModel):
    lot_id: str
    quantity_kg: int
    latitude: float
    longitude: float

class DropoffPoint(BaseModel):
    latitude: float
    longitude: float

class OptimizeRouteRequest(BaseModel):
    vehicle_capacity_kg: int
    pickups: List[PickupPoint]
    dropoff: DropoffPoint

class OrderedStop(BaseModel):
    type: str  # "PICKUP" or "DROPOFF"
    lot_id: Optional[str] = None

class OptimizeRouteResponse(BaseModel):
    total_distance_km: float
    route_coordinates: List[List[float]] # List of [latitude, longitude]
    ordered_stops: List[OrderedStop]

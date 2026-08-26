import math
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from models.schemas import OptimizeRouteRequest

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two lat/lon points on Earth."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_optimal_route(request: OptimizeRouteRequest):
    # 1. Prepare locations: [Dropoff (Node 0)] + [Pickups (Node 1, 2...)]
    # We treat the Buyer Dropoff as the "Depot" where the route ends.
    locations = [request.dropoff] + request.pickups
    num_locations = len(locations)
    
    # 2. Build Distance Matrix (OR-Tools requires integers, so we use meters)
    distance_matrix = []
    for i in range(num_locations):
        row = []
        for j in range(num_locations):
            dist_km = haversine_distance(locations[i].latitude, locations[i].longitude, 
                                         locations[j].latitude, locations[j].longitude)
            row.append(int(dist_km * 1000))
        distance_matrix.append(row)
        
    # 3. Build Demands Array (Dropoff demand is 0, pickups have positive weight)
    demands = [0] + [pickup.quantity_kg for pickup in request.pickups]
    
    # 4. Initialize OR-Tools Routing Manager (1 vehicle, Node 0 is Depot)
    manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0) 
    routing = pywrapcp.RoutingModel(manager)
    
    # Create distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Add Capacity constraints
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        [request.vehicle_capacity_kg],  # vehicle max capacities
        True,  # start cumul to zero
        'Capacity')

    # 5. Solve the problem
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    solution = routing.SolveWithParameters(search_parameters)
    if not solution:
        raise Exception("No routing solution found. Vehicle capacity might be exceeded.")
        
    # 6. Extract the solution to exactly match the API Contract
    index = routing.Start(0)
    ordered_stops = []
    route_coordinates = []
    total_distance_meters = 0
    
    is_first = True
    while not routing.IsEnd(index):
        node_index = manager.IndexToNode(index)
        
        # We skip the very first depot start point because the truck logically starts at the first pickup.
        if not is_first:
            route_coordinates.append([locations[node_index].latitude, locations[node_index].longitude])
            pickup = request.pickups[node_index - 1]
            ordered_stops.append({"type": "PICKUP", "lot_id": pickup.lot_id})
                
        is_first = False
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance_meters += routing.GetArcCostForVehicle(previous_index, index, 0)
        
    # Add the final drop-off (Return to Depot)
    node_index = manager.IndexToNode(index)
    route_coordinates.append([locations[node_index].latitude, locations[node_index].longitude])
    ordered_stops.append({"type": "DROPOFF"})
    
    return {
        "total_distance_km": round(total_distance_meters / 1000.0, 2),
        "route_coordinates": route_coordinates,
        "ordered_stops": ordered_stops
    }

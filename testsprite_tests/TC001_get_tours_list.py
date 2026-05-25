import requests

BASE_URL = "https://institute-duo-bob-newspapers.trycloudflare.com/api/v1"
TIMEOUT = 30

def test_get_tours_list():
    url = f"{BASE_URL}/tours"
    headers = {
        "Accept": "application/json"
    }
    # Example filters and pagination parameters for the test
    params = {
        "page": 1,
        "limit": 5,
        "search": "luxury",
        "tags": "vip",  # assuming 'tags' filter supported
        # add other filters as applicable
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        data = response.json()
        # Assert that 'data' is a dict and contains a list of tours
        assert isinstance(data, dict), "Response data should be a JSON object"
        assert "tours" in data or "items" in data or "data" in data, "Response JSON should contain a tours list"
        # Determine the key for tours list
        tours_list_key = None
        for key in ["tours", "items", "data"]:
            if key in data and isinstance(data[key], list):
                tours_list_key = key
                break
        assert tours_list_key is not None, "No tours list found in response keys"
        tours = data[tours_list_key]
        assert isinstance(tours, list), "Tours list should be a list"
        # Check pagination keys if present
        if "page" in data:
            assert isinstance(data["page"], int), "Page should be an integer"
        if "limit" in data:
            assert isinstance(data["limit"], int), "Limit should be an integer"
        if "total" in data:
            assert isinstance(data["total"], int), "Total should be an integer"
        # Validate each tour item structure minimally
        if len(tours) > 0:
            tour = tours[0]
            assert isinstance(tour, dict), "Each tour should be a dict"
            # Common expected keys in a tour item
            expected_keys = ["id", "title", "description", "country", "city"]
            for key in expected_keys:
                assert key in tour, f"Tour item missing expected key: {key}"
    except requests.Timeout:
        assert False, "Request timed out"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_tours_list()
import requests

BASE_URL = "https://dark-angels-backend-production.up.railway.app"
TIMEOUT = 30

def test_get_tours_list():
    url = f"{BASE_URL}/api/v1/tours"
    headers = {
        "Accept": "application/json"
    }
    params_list = [
        {},  # No filters/pagination
        {"page": 1, "perPage": 5},  # Pagination example
        {"country": "ru"},  # Filtering by localized country in Russian (dict key)
        {"city": "en"},  # Filtering by localized city in English (dict key)
        {"search": "luxury"},  # Searching by keyword (assuming supported)
    ]

    for params in params_list:
        try:
            response = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code} with params {params}"
        try:
            data = response.json()
        except ValueError:
            assert False, "Response is not a valid JSON"

        assert isinstance(data, dict), "Response JSON root should be a dict"
        # Assume the tours list is under 'data' or 'tours' key
        tours = None
        if "data" in data and isinstance(data["data"], list):
            tours = data["data"]
        elif "tours" in data and isinstance(data["tours"], list):
            tours = data["tours"]
        else:
            # Check if response itself is a list of tours
            if isinstance(data, list):
                tours = data

        assert tours is not None, "Response JSON does not contain a list of tours"
        assert isinstance(tours, list), "Tours must be a list"

        for tour in tours:
            assert isinstance(tour, dict), "Each tour should be a dictionary"
            # Check localized fields country and city can be dict or strings
            country = tour.get("country")
            city = tour.get("city")

            assert country is not None, "Tour should have a 'country' field"
            assert city is not None, "Tour should have a 'city' field"

            # Check if country field is either dict with keys ru/en or a string
            if isinstance(country, dict):
                assert "ru" in country or "en" in country, "Country dict must contain 'ru' or 'en' keys"
                # Values should be str if present
                if "ru" in country:
                    assert isinstance(country["ru"], str), "'ru' in country must be string"
                if "en" in country:
                    assert isinstance(country["en"], str), "'en' in country must be string"
            else:
                assert isinstance(country, str), "Country should be string if not a dict"

            # Same validation for city
            if isinstance(city, dict):
                assert "ru" in city or "en" in city, "City dict must contain 'ru' or 'en' keys"
                if "ru" in city:
                    assert isinstance(city["ru"], str), "'ru' in city must be string"
                if "en" in city:
                    assert isinstance(city["en"], str), "'en' in city must be string"
            else:
                assert isinstance(city, str), "City should be string if not a dict"

        # Additional pagination metadata checks if present
        if "meta" in data and isinstance(data["meta"], dict):
            meta = data["meta"]
            if "page" in meta:
                assert isinstance(meta["page"], int), "'page' in meta should be int"
            if "perPage" in meta:
                assert isinstance(meta["perPage"], int), "'perPage' in meta should be int"
            if "total" in meta:
                assert isinstance(meta["total"], int), "'total' in meta should be int"

test_get_tours_list()
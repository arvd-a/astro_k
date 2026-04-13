import urllib.request, json

data = json.dumps({
    "chart_data": {
        "metadata": {
            "calculation_engine": "pyswisseph",
            "ayanamsa": "Lahiri",
            "topocentric": False,
            "julian_day": 2454234.03,
            "user_location": {"lat": 9.15, "lon": 76.77, "tz": "Asia/Kolkata"}
        },
        "ascendant": {
            "absolute_degree": 200.0,
            "sign_index": 6,
            "sign_name": "Libra",
            "sign_degree": 20.0
        },
        "planets": [
            {"id": "su", "name": "Sun", "absolute_degree": 30.5, "sign_index": 1, "sign_name": "Taurus", "sign_degree": 0.5, "nakshatra_index": 3, "nakshatra_pada": 1, "is_retrograde": False}
        ],
        "houses": [
            {"house_number": i+1, "sign_index": (6+i)%12, "sign_name": "Libra"} for i in range(12)
        ]
    },
    "messages": [
        {"role": "user", "content": "What are the key strengths in my chart?"}
    ]
}).encode()

req = urllib.request.Request(
    'https://astro-k-api.onrender.com/api/chat',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    resp = urllib.request.urlopen(req, timeout=30)
    print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")

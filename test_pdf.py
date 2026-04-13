import urllib.request, json, sys

data = json.dumps({'date':'1990-01-15','time':'05:30','lat':8.5241,'lon':76.9366}).encode()
req = urllib.request.Request(
    'https://astro-k-api.onrender.com/api/chart/pdf',
    data=data,
    headers={'Content-Type':'application/json'}
)

try:
    resp = urllib.request.urlopen(req, timeout=120)
    pdf_bytes = resp.read()
    # Save to file for manual inspection
    with open('test_chart.pdf', 'wb') as f:
        f.write(pdf_bytes)
    print(f"SUCCESS — {len(pdf_bytes)} bytes saved to test_chart.pdf")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")

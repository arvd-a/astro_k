import urllib.request, json, sys

data=json.dumps({'date':'1990-01-15','time':'05:30','lat':8.5241,'lon':76.9366}).encode()
req=urllib.request.Request('https://astro-k-api.onrender.com/api/chart', data=data, headers={'Content-Type':'application/json'})

try:
    print(urllib.request.urlopen(req).read().decode())
except Exception as e:
    print(e.read().decode())

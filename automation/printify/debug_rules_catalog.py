#!/usr/bin/env python3
import json, os, urllib.request
API='https://api.printify.com/v1'
TOKEN=os.environ['PRINTIFY_API_TOKEN'].strip()
def req(path):
    r=urllib.request.Request(API+path,headers={'Authorization':f'Bearer {TOKEN}','User-Agent':'StormAndMe-Debug/3.0'})
    with urllib.request.urlopen(r,timeout=60) as res: return json.load(res)
shops=req('/shops.json')
preferred=[s for s in shops if 'storm' in s.get('title','').lower()]
shop=str((preferred[0] if preferred else shops[0])['id'])
print('SHOP',shop)
page=1
matches=[]
while True:
    result=req(f'/shops/{shop}/products.json?limit=50&page={page}')
    rows=result.get('data',[])
    for p in rows:
        title=p.get('title','')
        if 'Obama 2028' in title or p.get('id') in ['6a7bd33e44cf7ff645047bd3','6a7bd78b62d856b0f700a290']:
            full=req(f"/shops/{shop}/products/{p['id']}.json")
            matches.append({
                'id':full.get('id'),
                'title':full.get('title'),
                'visible':full.get('visible'),
                'is_locked':full.get('is_locked'),
                'external':full.get('external'),
                'url':full.get('url'),
                'images':[{'src':i.get('src'),'position':i.get('position'),'is_default':i.get('is_default')} for i in full.get('images',[])[:12]],
                'variants':[{'id':v.get('id'),'title':v.get('title'),'price':v.get('price'),'enabled':v.get('is_enabled')} for v in full.get('variants',[]) if v.get('is_enabled')][:12],
            })
    if not rows or page>=int(result.get('last_page',page)): break
    page+=1
print(json.dumps(matches,indent=2))

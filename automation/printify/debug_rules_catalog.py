#!/usr/bin/env python3
import json, os, urllib.request
API='https://api.printify.com/v1'
TOKEN=os.environ['PRINTIFY_API_TOKEN'].strip()
def req(path):
    r=urllib.request.Request(API+path,headers={'Authorization':f'Bearer {TOKEN}','User-Agent':'StormAndMe-Debug/5.0'})
    with urllib.request.urlopen(r,timeout=60) as res: return json.load(res)
shops=req('/shops.json')
print('SHOPS')
print(json.dumps(shops,indent=2))
for shop in ['28312107','26840227']:
    print('\nSHOP',shop)
    result=req(f'/shops/{shop}/products.json?limit=50&page=1')
    print('COUNT',len(result.get('data',[])))
    for p in result.get('data',[]):
        if p.get('id') in ['6a7bd33e44cf7ff645047bd3','6a7bd78b62d856b0f700a290'] or 'Obama 2028' in p.get('title',''):
            full=req(f"/shops/{shop}/products/{p['id']}.json")
            print(json.dumps({
              'id':full.get('id'),'title':full.get('title'),'visible':full.get('visible'),'external':full.get('external'),'url':full.get('url'),
              'blueprint_id':full.get('blueprint_id'),'print_provider_id':full.get('print_provider_id'),
              'images':[{'src':i.get('src'),'position':i.get('position')} for i in full.get('images',[])[:4]],
              'enabled_variants':[{'id':v.get('id'),'title':v.get('title'),'price':v.get('price')} for v in full.get('variants',[]) if v.get('is_enabled')][:20],
              'print_areas':full.get('print_areas'),
            },indent=2))

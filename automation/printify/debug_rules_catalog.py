#!/usr/bin/env python3
import json, os, urllib.request, urllib.error
API='https://api.printify.com/v1'
TOKEN=os.environ['PRINTIFY_API_TOKEN'].strip()
def req(path):
    r=urllib.request.Request(API+path,headers={'Authorization':f'Bearer {TOKEN}','User-Agent':'StormAndMe-Debug/1.0'})
    with urllib.request.urlopen(r,timeout=60) as res: return json.load(res)
blueprints=req('/catalog/blueprints.json')
if isinstance(blueprints,dict): blueprints=blueprints.get('data',blueprints.get('blueprints',[]))
for bp in blueprints:
    title=bp.get('title','').lower()
    if any(k in title for k in ['garment-dyed','heavy cotton','hoodie','hooded sweatshirt','heavy blend']):
        print('\nBLUEPRINT',bp.get('id'),bp.get('title'))
        try:
            providers=req(f"/catalog/blueprints/{bp['id']}/print_providers.json")
            if isinstance(providers,dict): providers=providers.get('data',providers.get('print_providers',[]))
            for provider in providers[:4]:
                pid=provider.get('id')
                cat=req(f"/catalog/blueprints/{bp['id']}/print_providers/{pid}/variants.json")
                print(' PROVIDER',pid,provider.get('title'))
                print(' POSITIONS',[p.get('position') for p in cat.get('placeholders',[])])
                print(' VARIANTS',[v.get('title') for v in cat.get('variants',[]) if v.get('is_available',True)][:30])
        except Exception as e:
            print(' ERROR',e)

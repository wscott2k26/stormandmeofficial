#!/usr/bin/env python3
import json, os, urllib.request
API='https://api.printify.com/v1'
TOKEN=os.environ['PRINTIFY_API_TOKEN'].strip()
def req(path):
    r=urllib.request.Request(API+path,headers={'Authorization':f'Bearer {TOKEN}','User-Agent':'StormAndMe-Debug/2.0'})
    with urllib.request.urlopen(r,timeout=60) as res: return json.load(res)
blueprints=req('/catalog/blueprints.json')
if isinstance(blueprints,dict): blueprints=blueprints.get('data',blueprints.get('blueprints',[]))
for bp in blueprints:
    title=bp.get('title','')
    low=title.lower()
    if bp.get('id') == 706 or any(k in low for k in ['garment-dyed t-shirt','heavy cotton tee','heavy blend hooded','heavyweight hoodie']):
        print('CANDIDATE',bp.get('id'),title)
print('\nDETAIL 706')
for bp_id in [706]:
    providers=req(f'/catalog/blueprints/{bp_id}/print_providers.json')
    if isinstance(providers,dict): providers=providers.get('data',providers.get('print_providers',[]))
    for provider in providers[:8]:
        pid=provider.get('id')
        cat=req(f'/catalog/blueprints/{bp_id}/print_providers/{pid}/variants.json')
        print('PROVIDER',pid,provider.get('title'))
        print('POSITIONS',[p.get('position') for p in cat.get('placeholders',[])])
        vals=[v.get('title') for v in cat.get('variants',[]) if v.get('is_available',True)]
        print('VARIANTS',vals[:60])

#!/usr/bin/env python3
import html, json, os, re, urllib.request
API='https://api.printify.com/v1'
TOKEN=os.environ['PRINTIFY_API_TOKEN'].strip()
STORE='https://storm-and-me-official.printify.me'
def req(path):
    r=urllib.request.Request(API+path,headers={'Authorization':f'Bearer {TOKEN}','User-Agent':'StormAndMe-Debug/4.0'})
    with urllib.request.urlopen(r,timeout=60) as res: return json.load(res)
def fetch(url):
    r=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 StormAndMe-Debug/4.0','Accept':'text/html,application/xhtml+xml'})
    with urllib.request.urlopen(r,timeout=60) as res: return res.status,res.geturl(),res.read().decode('utf-8','replace')
shops=req('/shops.json')
preferred=[s for s in shops if 'storm' in s.get('title','').lower()]
shop=str((preferred[0] if preferred else shops[0])['id'])
print('SHOP',shop)
result=req(f'/shops/{shop}/products.json?limit=50&page=1')
print('API OBAMA PRODUCTS')
for p in result.get('data',[]):
    if 'Obama 2028' in p.get('title',''):
        full=req(f"/shops/{shop}/products/{p['id']}.json")
        print(json.dumps({'id':full.get('id'),'title':full.get('title'),'visible':full.get('visible'),'external':full.get('external'),'url':full.get('url'),'images':full.get('images',[])[:2]},indent=2))
print('\nSTOREFRONT')
status,final,body=fetch(STORE)
print('STATUS',status,'FINAL',final,'LEN',len(body))
text=html.unescape(body)
for pattern in [r'href=["\']([^"\']+)["\']',r'"url":"([^"]+)"',r'"handle":"([^"]+)"']:
    vals=[]
    for match in re.findall(pattern,text,re.I):
        if 'product' in match.lower() or 'obama' in match.lower(): vals.append(match)
    print('MATCHES',pattern,vals[:80])
idx=text.lower().find('obama')
print('OBAMA_INDEX',idx)
if idx>=0: print(text[max(0,idx-1200):idx+2500])

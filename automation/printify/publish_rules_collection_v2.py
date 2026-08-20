#!/usr/bin/env python3
import base64, io, json, math, os, random, re, sys, time, urllib.error, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

API = 'https://api.printify.com/v1'
TOKEN = os.environ.get('PRINTIFY_API_TOKEN', '').strip()
SHOP_ID = os.environ.get('PRINTIFY_SHOP_ID', '').strip()
SHOP_URL = 'https://storm-and-me-official.printify.me'
LOGO_URL = 'https://static.prod-images.emergentagent.com/jobs/7463b3a3-ce4d-4fcb-8b80-776d01ad6286/images/a3d5a538ff81f998f6794bf45162190a817187cbc7de2e5721dad88e66e09e8f.png'
OUT = Path('automation-output')
DATA = Path('frontend/src/data/rules-products.generated.json')
OUT.mkdir(exist_ok=True)
DATA.parent.mkdir(parents=True, exist_ok=True)
COLLECTION = 'RULES DON’T EXIST ANYMORE'
SIZES = ['s','m','l','xl','2xl','3xl']

PRODUCTS = [
    dict(id='rules-black-tee', kind='tee', label='Washed Black', title='Obama 2028 — Vintage Black Statement Tee', price=3200, palette='dark', color='pepper', description='Vintage wash. Bold truth. No apologies.'),
    dict(id='rules-hoodie', kind='hoodie', label='Premium Hoodie', title='Obama 2028 — Statement Hoodie', price=6200, palette='light', color='sand', description='Premium heavy blend. Comfort meets conviction.'),
    dict(id='rules-white-tee', kind='tee', label='White Tee', title='Obama 2028 — White Statement Tee', price=2800, palette='light', color='white', description='Crisp, clean, and loud. The message speaks for itself.'),
]


def req(method, path, payload=None):
    body = None if payload is None else json.dumps(payload).encode()
    r = urllib.request.Request(API + path, data=body, method=method, headers={
        'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'StormAndMe-Rules/2.0'})
    try:
        with urllib.request.urlopen(r, timeout=90) as res:
            raw = res.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors='replace')
        raise RuntimeError(f'Printify API {e.code} on {path}: {detail}') from e


def fetch_bytes(url):
    r = urllib.request.Request(url, headers={'User-Agent':'StormAndMe-Rules/2.0'})
    with urllib.request.urlopen(r, timeout=90) as res: return res.read()


def shop_id():
    if SHOP_ID: return SHOP_ID
    shops = req('GET','/shops.json')
    if not shops: raise RuntimeError('No Printify shop found')
    preferred = [s for s in shops if 'storm' in s.get('title','').lower()]
    return str((preferred[0] if preferred else shops[0])['id'])


def font(size):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p,size)
    return ImageFont.load_default()


def center(draw, text, y, f, fill, W=4500):
    b = draw.textbbox((0,0),text,font=f); w=b[2]-b[0]
    draw.text(((W-w)//2,y),text,font=f,fill=fill)


def star(draw,cx,cy,r,fill):
    pts=[]
    for i in range(10):
        a=-math.pi/2+i*math.pi/5; rr=r if i%2==0 else r*.44
        pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
    draw.polygon(pts,fill=fill)


def back_art(palette):
    W,H=4500,5400
    img=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    primary=(242,233,214,255) if palette=='dark' else (20,48,88,255)
    red=(183,43,48,255)
    center(d,'OBAMA',500,font(650),primary)
    center(d,'2028',1240,font(770),primary)
    star(d,820,1670,220,red); star(d,3680,1670,220,red)
    for off,color,h in [(0,primary,42),(95,red,70),(215,primary,42)]:
        y=2110+off
        d.rounded_rectangle((700,y,1710,y+h),radius=18,fill=color)
        d.rounded_rectangle((2790,y,3800,y+h),radius=18,fill=color)
    center(d,'SINCE',2030,font(370),primary)
    center(d,"RULES DON'T",2730,font(470),red)
    center(d,'EXIST ANYMORE',3350,font(390),primary)
    rng=random.Random(2028 if palette=='light' else 2029)
    alpha=img.getchannel('A'); ad=ImageDraw.Draw(alpha)
    for _ in range(1100):
        x=rng.randint(850,3650); y=rng.randint(450,4050); w=rng.randint(8,55); h=rng.randint(3,18)
        ad.rectangle((x,y,x+w,y+h),fill=rng.randint(0,120))
    img.putalpha(alpha)
    return img


def png_bytes(img):
    b=io.BytesIO(); img.save(b,format='PNG',optimize=True); return b.getvalue()


def logo_bytes():
    logo=Image.open(io.BytesIO(fetch_bytes(LOGO_URL))).convert('RGBA')
    alpha=logo.getchannel('A')
    if alpha.getextrema()[0]==255:
        bg=logo.getpixel((0,0))[:3]; px=logo.load()
        for y in range(logo.height):
            for x in range(logo.width):
                r,g,b,a=px[x,y]; dist=((r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2)**.5
                if dist<52: px[x,y]=(r,g,b,0)
                elif dist<88: px[x,y]=(r,g,b,int(a*(dist-52)/36))
    box=logo.getbbox()
    if not box: raise RuntimeError('Official Storm And Me logo cleanup produced empty art')
    logo=logo.crop(box); logo.thumbnail((1900,1900),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(2400,2400),(0,0,0,0)); out.alpha_composite(logo,((2400-logo.width)//2,(2400-logo.height)//2))
    return png_bytes(out)


def upload(name,raw):
    return req('POST','/uploads/images.json',{'file_name':name,'contents':base64.b64encode(raw).decode()})['id']


def norm_size(title):
    low=title.lower().replace('xxxl','3xl').replace('xxl','2xl')
    return set(re.split(r'[^a-z0-9]+',low))


def select_variants(rows,color):
    picked=[]
    for v in rows:
        if not v.get('is_available',True): continue
        title=v.get('title','').lower()
        if color not in title: continue
        if not any(s in norm_size(title) for s in SIZES): continue
        picked.append(v)
    return picked


def tee_catalog(color):
    # Comfort Colors 1717 / garment-dyed tee. Marco Fine Arts exposes Pepper + White through provider 3.
    bp,pid=706,3
    cat=req('GET',f'/catalog/blueprints/{bp}/print_providers/{pid}/variants.json')
    variants=select_variants(cat.get('variants',[]),color)
    if not variants: raise RuntimeError(f'No {color} variants for tee blueprint {bp}/provider {pid}')
    return bp,pid,variants


def hoodie_catalog():
    blueprints=req('GET','/catalog/blueprints.json')
    if isinstance(blueprints,dict): blueprints=blueprints.get('data',blueprints.get('blueprints',[]))
    candidates=[]
    for bp in blueprints:
        t=bp.get('title','').lower()
        if 'unisex' in t and 'hood' in t and 'zip' not in t and ('heavy' in t or 'blend' in t):
            score=(10 if 'heavy blend' in t else 0)+(5 if 'hooded sweatshirt' in t else 0)
            candidates.append((score,bp))
    candidates.sort(key=lambda x:x[0],reverse=True)
    colors=['sand','natural','cream','ivory','white']
    for _,bp in candidates:
        providers=req('GET',f"/catalog/blueprints/{bp['id']}/print_providers.json")
        if isinstance(providers,dict): providers=providers.get('data',providers.get('print_providers',[]))
        for p in providers:
            pid=p.get('id')
            try: cat=req('GET',f"/catalog/blueprints/{bp['id']}/print_providers/{pid}/variants.json")
            except Exception: continue
            for color in colors:
                variants=select_variants(cat.get('variants',[]),color)
                if variants:
                    print(f"Selected hoodie: blueprint {bp['id']} {bp.get('title')} / provider {pid} / color {color}")
                    return int(bp['id']),int(pid),variants,color
    raise RuntimeError('Could not find a light premium unisex pullover hoodie with S-3XL variants')


def existing(shop,title):
    page=1
    while True:
        result=req('GET',f'/shops/{shop}/products.json?limit=50&page={page}')
        rows=result.get('data',[]) if isinstance(result,dict) else []
        for p in rows:
            if p.get('title','').strip().lower()==title.strip().lower():
                return req('GET',f"/shops/{shop}/products/{p['id']}.json")
        if not rows or page>=int(result.get('last_page',page)): break
        page+=1
    return None


def create(shop,spec,back_id,logo_id,hoodie_choice=None):
    old=existing(shop,spec['title'])
    if old: return old,'existing'
    if spec['kind']=='tee': bp,pid,variants=tee_catalog(spec['color'])
    else:
        bp,pid,variants,actual_color=hoodie_choice
        spec['color']=actual_color
    rows=[{'id':v['id'],'price':spec['price'],'is_enabled':True,'is_default':i==0} for i,v in enumerate(variants)]
    vids=[v['id'] for v in variants]
    payload={
        'title':spec['title'],
        'description':spec['description']+' Satirical apparel concept. Not affiliated with, endorsed by, or connected to any political campaign.',
        'tags':['Storm And Me','satire','Obama 2028','Rules Don’t Exist Anymore'],
        'blueprint_id':bp,'print_provider_id':pid,'variants':rows,
        'print_areas':[{'variant_ids':vids,'placeholders':[
            {'position':'back','images':[{'id':back_id,'x':0.5,'y':0.5,'scale':0.90,'angle':0}]},
            {'position':'front','images':[{'id':logo_id,'x':0.33,'y':0.28,'scale':0.22,'angle':0}]}
        ]}]
    }
    made=req('POST',f'/shops/{shop}/products.json',payload); pid_product=made['id']
    req('POST',f'/shops/{shop}/products/{pid_product}/publish.json',{'title':True,'description':True,'images':True,'variants':True,'tags':True,'keyFeatures':True})
    return req('GET',f'/shops/{shop}/products/{pid_product}.json'),'created'


def poll(shop,pid):
    latest={}
    for _ in range(24):
        latest=req('GET',f'/shops/{shop}/products/{pid}.json')
        if latest.get('images') and latest.get('external'): return latest
        time.sleep(5)
    return latest


def back_image(product):
    imgs=product.get('images',[])
    for im in imgs:
        if str(im.get('position','')).lower()=='back' and im.get('src'): return im['src']
    for im in imgs:
        if 'back' in im.get('src','').lower(): return im['src']
    return next((im.get('src') for im in imgs if im.get('src')),'')


def direct_url(product):
    ext=product.get('external') or {}
    if isinstance(ext,dict):
        for k in ('url','link'):
            if isinstance(ext.get(k),str) and ext[k].startswith('http'): return ext[k]
        if ext.get('id'): return f"{SHOP_URL}/product/{ext['id']}"
    for k in ('url','external_url'):
        if isinstance(product.get(k),str) and product[k].startswith('http'): return product[k]
    return ''


def main():
    if not TOKEN: raise RuntimeError('Missing PRINTIFY_API_TOKEN')
    shop=shop_id()
    logo_id=upload('storm-and-me-official-chest-mark.png',logo_bytes())
    art={'light':upload('obama-2028-rules-light-back.png',png_bytes(back_art('light'))),'dark':upload('obama-2028-rules-dark-back.png',png_bytes(back_art('dark')))}
    hoodie_choice=hoodie_catalog()
    site=[]; report=[]
    for spec in PRODUCTS:
        prod,action=create(shop,spec,art[spec['palette']],logo_id,hoodie_choice)
        prod=poll(shop,prod['id'])
        image=back_image(prod); url=direct_url(prod)
        if not image: raise RuntimeError(f"No Printify mockup image for {spec['title']}")
        if not url: raise RuntimeError(f"No direct storefront URL yet for {spec['title']}; rerun after Printify sync")
        site.append({'id':spec['id'],'printify_product_id':prod['id'],'title':spec['title'],'label':spec['label'],'price_cents':spec['price'],'price':f"${spec['price']/100:.2f}",'image':image,'url':url,'description':spec['description'],'visible':bool(prod.get('visible',True))})
        report.append({'id':spec['id'],'product_id':prod['id'],'action':action,'title':spec['title'],'color':spec['color'],'image':image,'url':url,'visible':prod.get('visible'),'variant_count':len(prod.get('variants',[]))})
        time.sleep(2)
    DATA.write_text(json.dumps({'collection':COLLECTION,'generated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'products':site},indent=2)+'\n')
    OUT.joinpath('rules-collection-results.json').write_text(json.dumps({'shop_id':shop,'results':report},indent=2)+'\n')
    print(json.dumps({'shop_id':shop,'results':report},indent=2))

if __name__=='__main__':
    try: main()
    except Exception as e:
        print('ERROR:',e,file=sys.stderr); sys.exit(1)

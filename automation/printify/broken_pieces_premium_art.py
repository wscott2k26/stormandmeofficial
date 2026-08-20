import math, os, random
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

W,H=4500,5400
TRANSPARENT=(0,0,0,0)
TAN=(203,181,153,255)
TAN_DARK=(151,126,98,255)
GOLD=(224,165,78,255)
GLOW=(255,222,156,255)


def _font_path(italic=False):
    candidates = ([
        '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Oblique.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf',
    ] if italic else [
        '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    ])
    for p in candidates:
        if os.path.exists(p): return p
    return None

def font(size, italic=False):
    p=_font_path(italic)
    return ImageFont.truetype(p,size) if p else ImageFont.load_default()

def fit_font(draw,text,max_width,start,floor=120,italic=False):
    size=start
    while size>=floor:
        f=font(size,italic)
        box=draw.textbbox((0,0),text,font=f)
        if box[2]-box[0] <= max_width: return f
        size-=16
    return font(floor,italic)

def heart_points(cx,cy,scale):
    pts=[]
    for i in range(320):
        t=math.pi*2*i/320
        x=16*math.sin(t)**3
        y=13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t)
        pts.append((cx+x*scale, cy-y*scale))
    return pts

def texture_rgb(seed, size, dark=(58,49,42), mid=(133,111,88), light=(210,188,158)):
    rng=random.Random(seed)
    tw,th=size
    sw=max(48,min(520,max(1,tw//5)))
    sh=max(48,min(620,max(1,th//5)))
    coarse=Image.effect_noise((sw,sh),70).filter(ImageFilter.GaussianBlur(1.6))
    fine=Image.effect_noise((sw,sh),28)
    g=Image.blend(coarse,fine,0.32).resize((tw,th),Image.Resampling.BICUBIC)
    base=ImageOps.colorize(g,dark,light)
    d=ImageDraw.Draw(base)
    speckles=min(500,max(40,(tw*th)//45000))
    for _ in range(speckles):
        x=rng.randrange(max(1,tw)); y=rng.randrange(max(1,th)); r=rng.randrange(2,14)
        if rng.random()<0.58:
            c=tuple(max(0,min(255,v+rng.randrange(-24,25))) for v in mid)
            d.ellipse((x-r,y-r,x+r,y+r),fill=c)
    return base

def apply_texture(image, mask, seed, dark, mid, light, distress_seed=None, distress_count=700):
    working=mask.copy()
    if distress_seed is not None:
        rng=random.Random(distress_seed); d=ImageDraw.Draw(working); bb=working.getbbox()
        if bb:
            x0,y0,x1,y1=bb
            for _ in range(distress_count):
                x=rng.randint(x0,max(x0,x1-1)); y=rng.randint(y0,max(y0,y1-1))
                rw=rng.randint(8,46); rh=rng.randint(3,18)
                d.ellipse((x,y,x+rw,y+rh),fill=rng.choice([0,40,80]))
    bb=working.getbbox()
    if not bb:
        return
    x0,y0,x1,y1=bb
    local_mask=working.crop(bb)
    texture=texture_rgb(seed,(x1-x0,y1-y0),dark,mid,light).convert('RGBA')
    texture.putalpha(local_mask)
    image.alpha_composite(texture,(x0,y0))

def text_mask(text,y,size,max_width=3700,italic=False):
    f=fit_font(ImageDraw.Draw(Image.new('L',(1,1))),text,max_width,size,max(120,int(size*.55)),italic)
    mask=Image.new('L',(W,H),0); d=ImageDraw.Draw(mask)
    box=d.textbbox((0,0),text,font=f); tw=box[2]-box[0]
    d.text(((W-tw)//2,y),text,font=f,fill=255)
    return mask

def textured_text(image,text,y,size,seed,max_width=3700,italic=False,palette='tan'):
    m=text_mask(text,y,size,max_width,italic)
    if palette=='gold':
        pal=((104,67,27),(186,124,50),(255,205,118))
    elif palette=='darktan':
        pal=((72,59,48),(140,112,82),(195,156,112))
    else:
        pal=((94,79,64),(167,141,108),(225,204,174))
    apply_texture(image,m,seed,*pal,distress_seed=seed+900,distress_count=(70 if italic else 180))

def draw_label(image,y=3700,seed=99):
    textured_text(image,'BROKEN PIECES',y,380,seed,3400)

def premium_glow_line(image,pts,width=28):
    glow=Image.new('RGBA',(W,H),TRANSPARENT)
    gd=ImageDraw.Draw(glow)
    gd.line(pts,fill=(255,145,38,205),width=width*5,joint='curve')
    glow=glow.filter(ImageFilter.GaussianBlur(width*2.4))
    image.alpha_composite(glow)
    core=Image.new('RGBA',(W,H),TRANSPARENT); cd=ImageDraw.Draw(core)
    cd.line(pts,fill=(255,177,63,255),width=width*2,joint='curve')
    cd.line(pts,fill=(255,236,183,255),width=max(8,width//2),joint='curve')
    image.alpha_composite(core)

def add_stone_cracks(image, lines, dark=True):
    d=ImageDraw.Draw(image)
    for line in lines:
        if dark:
            d.line(line,fill=(25,20,17,245),width=58,joint='curve')
            d.line(line,fill=(79,62,46,235),width=19,joint='curve')
        else:
            premium_glow_line(image,line,26)

def front_cracked_heart():
    im=Image.new('RGBA',(W,H),TRANSPARENT)
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(heart_points(2030,1900,108),fill=255)
    apply_texture(im,m,101,(76,62,50),(160,132,101),(226,203,170),distress_seed=404)
    lines=[[(2020,840),(1900,1290),(2110,1650),(1880,2020),(2070,2410),(1940,2920)],[(1900,1290),(1550,1480),(1310,1820)],[(2110,1650),(2470,1500),(2740,1200)],[(1880,2020),(1510,2180),(1320,2500)],[(2070,2410),(2420,2300),(2680,1980)],[(1550,1480),(1670,1120)],[(2470,1500),(2540,1120)]]
    add_stone_cracks(im,lines,True)
    d=ImageDraw.Draw(im)
    d.polygon([(2670,1120),(3110,1400),(2840,1700),(3070,2010),(2760,2290),(2990,2620),(2550,3070)],fill=TRANSPARENT)
    rng=random.Random(505)
    for index in range(24):
        x=rng.randint(2740,3540); y=rng.randint(1120,2860); s=rng.randint(70,210)
        shard=Image.new('L',(W,H),0); sd=ImageDraw.Draw(shard)
        sd.polygon([(x,y),(x+s,y+rng.randint(-40,80)),(x+rng.randint(15,s),y+s)],fill=255)
        apply_texture(im,shard,600+index,(80,65,52),(155,127,96),(220,196,163),distress_count=0)
    draw_label(im,3600,808)
    return im

def front_kintsugi_heart():
    im=Image.new('RGBA',(W,H),TRANSPARENT)
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(heart_points(2250,1900,110),fill=255)
    apply_texture(im,m,202,(22,21,20),(67,58,49),(128,105,77),distress_seed=808)
    lines=[[(2100,830),(2170,1250),(2010,1560),(2300,1930),(2180,2310),(2350,2900)],[(2170,1250),(1730,1180),(1450,1450)],[(2010,1560),(1650,1870),(1470,2260)],[(2300,1930),(2760,1730),(3040,1420)],[(2180,2310),(2630,2380),(2880,2720)],[(1730,1870),(1890,2440),(1710,2730)],[(2760,1730),(2850,2180)]]
    for l in lines: premium_glow_line(im,l,24)
    draw_label(im,3600,818)
    return im

def cross_mask():
    m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
    d.rounded_rectangle((1810,620,2690,3190),radius=35,fill=255)
    d.rounded_rectangle((920,1270,3580,2130),radius=35,fill=255)
    return m

def front_broken_cross():
    im=Image.new('RGBA',(W,H),TRANSPARENT); m=cross_mask()
    apply_texture(im,m,303,(35,31,28),(90,76,61),(158,131,98),distress_seed=909)
    lines=[[(2250,650),(2120,1110),(2350,1430),(2130,1770),(2350,2140),(2190,2610),(2320,3140)],[(2120,1110),(1800,1320),(1460,1430)],[(2350,1430),(2730,1280),(3120,1460)],[(2130,1770),(1730,1870),(1240,1780)],[(2350,2140),(2770,1980),(3260,2080)]]
    for l in lines: premium_glow_line(im,l,30)
    rng=random.Random(1203); d=ImageDraw.Draw(im)
    for _ in range(55):
        x=rng.randint(1100,3400); y=rng.randint(800,3000); r=rng.randint(10,38)
        if rng.random()<.55: d.ellipse((x-r,y-r,x+r,y+r),fill=(156,118,74,rng.randint(90,190)))
    draw_label(im,3570,828)
    return im

def puzzle_mask():
    m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
    d.rounded_rectangle((1280,850,3200,3040),radius=80,fill=255)
    d.ellipse((1950,520,2550,1120),fill=255); d.ellipse((2920,1610,3520,2210),fill=255)
    d.ellipse((1950,2740,2550,3340),fill=0); d.ellipse((980,1610,1580,2210),fill=0)
    return m

def front_puzzle_piece():
    im=Image.new('RGBA',(W,H),TRANSPARENT); m=puzzle_mask()
    md=ImageDraw.Draw(m)
    broken_holes=[(2760,1450,3120,1810),(2900,1760,3260,2140),(2670,1950,3060,2310),(2980,2140,3380,2500)]
    for box in broken_holes:
        md.ellipse(box,fill=0)
    md.polygon([(3040,1350),(3490,1580),(3260,1890),(3510,2110),(3240,2490),(3040,2300)],fill=0)
    apply_texture(im,m,404,(25,24,22),(70,61,53),(139,114,86),distress_seed=1001,distress_count=900)
    lines=[[(2460,930),(2590,1340),(2470,1690),(2740,2030),(2610,2470),(2860,2860)],[(2470,1690),(2090,1580),(1840,1310)]]
    for l in lines: premium_glow_line(im,l,25)
    for edge in [[(2790,1480),(3000,1600),(2860,1780)],[(2910,1780),(3120,1930),(2930,2140)],[(2710,1980),(2910,2160),(2780,2300)],[(3000,2160),(3200,2320),(3060,2460)]]:
        premium_glow_line(im,edge,30)
    rng=random.Random(1414)
    for i in range(20):
        x=rng.randint(3050,3630); y=rng.randint(1400,2550); s=rng.randint(35,120)
        shard=Image.new('L',(W,H),0); sd=ImageDraw.Draw(shard)
        sd.polygon([(x,y),(x+s,y+rng.randint(-25,65)),(x+rng.randint(10,s),y+s)],fill=255)
        apply_texture(im,shard,1500+i,(55,45,36),(110,86,60),(190,145,90),distress_count=0)
    draw_label(im,3570,838)
    return im

def front_streetwear():
    im=Image.new('RGBA',(W,H),TRANSPARENT)
    textured_text(im,'BROKEN',760,1150,505,3600)
    textured_text(im,'PIECES',1900,1150,506,3600)
    textured_text(im,'STILL BREATHING.',3300,460,507,3200,True,'gold')
    return im

def wrap_lines(text,max_width,start=560,max_lines=6):
    d=ImageDraw.Draw(Image.new('L',(1,1))); f=font(start)
    lines=[]; current=''
    for w in text.split():
        cand=(current+' '+w).strip()
        if d.textbbox((0,0),cand,font=f)[2]<=max_width: current=cand
        else:
            if current: lines.append(current)
            current=w
    if current: lines.append(current)
    if len(lines)>max_lines: return wrap_lines(text,max_width,start-30,max_lines)
    return lines,f

def back_statement(text,kind):
    im=Image.new('RGBA',(W,H),TRANSPARENT)
    lines,f=wrap_lines(text,3300,540,6); lh=int(f.size*1.06); total=lh*len(lines); y=max(760,(H-total)//2-330)
    for i,line in enumerate(lines): textured_text(im,line,y+i*lh,f.size,700+i,3400)
    if kind=='broken-cross':
        yy=y+len(lines)*lh+120; arc=Image.new('L',(W,H),0); ad=ImageDraw.Draw(arc); ad.arc((1250,yy-80,3250,yy+170),190,350,fill=255,width=25)
        apply_texture(im,arc,901,(110,73,38),(189,126,59),(242,190,115),distress_count=0)
    textured_text(im,'Willy Will',min(H-820,y+total+460),340,933,2100,True,'gold')
    return im

def back_streetwear():
    im=Image.new('RGBA',(W,H),TRANSPARENT)
    m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m); cx,cy=2250,850
    d.arc((cx-300,cy-170,cx+40,cy+130),190,360,fill=255,width=36); d.arc((cx-30,cy-250,cx+360,cy+130),180,350,fill=255,width=36); d.line((cx-230,cy+90,cx+230,cy+90),fill=255,width=36)
    d.polygon([(2250,760),(2090,1080),(2240,1060),(2150,1350),(2440,980),(2280,1000)],fill=255)
    apply_texture(im,m,1002,(97,58,24),(187,123,50),(247,194,111),distress_count=0)
    textured_text(im,'Willy Will',4000,320,1003,1800,True,'gold')
    return im

def build_art(spec):
    builders={'cracked-heart':front_cracked_heart,'kintsugi-heart':front_kintsugi_heart,'broken-cross':front_broken_cross,'streetwear':front_streetwear,'puzzle-piece':front_puzzle_piece}
    front=builders[spec['front_kind']]()
    back=back_streetwear() if spec['front_kind']=='streetwear' else back_statement(spec['back_text'],spec['front_kind'])
    return front,back

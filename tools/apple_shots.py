# The App Store's iPhone 6.9" pictures (1320 x 2868) from the Google Play ones (store/play/, 1080 x 2160 – tools/store_shots.js):
# each screen scaled to the full width, the band above and below filled with the screen's own edge colour.
# Run after store_shots.js:  python3 -I tools/apple_shots.py  →  store/apple/ (+ en/)
import os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'store')
W, H, SH = 1320, 2868, 2640
for src, dst in [('play', 'apple'), (os.path.join('play', 'en'), os.path.join('apple', 'en'))]:
    s, d = os.path.join(ROOT, src), os.path.join(ROOT, dst); os.makedirs(d, exist_ok=True)
    for f in sorted(os.listdir(s)):
        if not f.startswith('phone_'): continue
        im = Image.open(os.path.join(s, f)).convert('RGB').resize((W, SH), Image.LANCZOS)
        out = Image.new('RGB', (W, H), im.getpixel((5, 2)))
        out.paste(Image.new('RGB', (W, H // 2), im.getpixel((5, SH - 3))), (0, H // 2))
        out.paste(im, (0, (H - SH) // 2))
        out.save(os.path.join(d, f.replace('phone_', 'iphone69_'))); print('  ✓', dst, f.replace('phone_', 'iphone69_'))

from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).resolve().parents[1] / "assets"
out.mkdir(exist_ok=True)
im = Image.new("RGBA", (512, 512))
d = ImageDraw.Draw(im)
d.rounded_rectangle((12, 12, 500, 500), radius=112, fill="#bd644b")
d.rounded_rectangle((94, 170, 418, 379), radius=40, outline="#fff3da", width=20)
d.rounded_rectangle((174, 118, 310, 193), radius=22, fill="#fff3da")
d.rectangle((176, 166, 308, 192), fill="#bd644b")
d.ellipse((185, 206, 327, 348), outline="#fff3da", width=19)
d.ellipse((224, 245, 288, 309), fill="#e5b18c")
d.ellipse((358, 201, 376, 219), fill="#f2cfa2")
im.save(out / "icon.png")
im.save(out / "icon.ico", sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])

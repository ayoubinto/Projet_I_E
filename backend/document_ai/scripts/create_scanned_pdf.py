from PIL import Image

image = Image.open("6.png").convert("RGB")

image.save(
    "facture_scanned.pdf",
    "PDF"
)

print("PDF scanné créé.")
import os
import re

directories = ["app", "components"]
color_classes = set()

# Regex to find bg-[#xxx], text-[#xxx], border-[#xxx], from/via/to-[#xxx]
pattern = re.compile(r'\b(?:bg|text|border|from|via|to)-\[#([A-Fa-f0-9]+)\]')

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".css"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                    matches = pattern.findall(content)
                    for match in matches:
                        color_classes.add(match)

print("Unique Hardcoded Colors (Hex without #):")
for color in sorted(list(color_classes)):
    print(f"#{color.lower()}")

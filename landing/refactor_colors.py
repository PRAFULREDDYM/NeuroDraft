import os
import re

css_additions = """
/* Theming */
:root {
  --page-bg: #0a0a0a;
  --surface: #111111;
  --surface-sunken: #0d0d0d;
  --surface-deep: #080808;
  --surface-alt: #0f0f0f;
  --border: #1a1a1a;
  --border-strong: #222222;
  --text-primary: #f8fafc;
  --text-muted: #888888;
  --text-soft: #555555;
  --text-faint: #444444;
  --black-swap: #000000;
  --accent-muted: rgba(14, 165, 233, 0.15);
  --accent-primary: #0ea5e9;
}

:root[data-theme='light'] {
  --page-bg: #f8fafc;
  --surface: #ffffff;
  --surface-sunken: #f1f5f9;
  --surface-deep: #e2e8f0;
  --surface-alt: #f1f5f9;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --text-primary: #0f172a;
  --text-muted: #475569;
  --text-soft: #64748b;
  --text-faint: #94a3b8;
  --black-swap: #ffffff;
  --accent-muted: rgba(14, 165, 233, 0.1);
  --accent-primary: #0284c7;
}

body {
  background-color: var(--page-bg);
  color: var(--text-primary);
}
"""

color_map = {
    '[#0a0a0a]': '[var(--page-bg)]',
    '[#111111]': '[var(--surface)]',
    '[#111]': '[var(--surface)]',
    '[#0d0d0d]': '[var(--surface-sunken)]',
    '[#080808]': '[var(--surface-deep)]',
    '[#0f0f0f]': '[var(--surface-alt)]',
    '[#1a1a1a]': '[var(--border)]',
    '[#222222]': '[var(--border-strong)]',
    '[#222]': '[var(--border-strong)]',
    '[#333]': '[var(--border-strong)]',
    '[#888888]': '[var(--text-muted)]',
    '[#888]': '[var(--text-muted)]',
    '[#555555]': '[var(--text-soft)]',
    '[#555]': '[var(--text-soft)]',
    '[#444444]': '[var(--text-faint)]',
    '[#444]': '[var(--text-faint)]',
    '[#0d2016]': '[var(--accent-muted)]',
    '[#000]': '[var(--black-swap)]',
    '[#ef4444]': 'red-500',
    '[#d1d5db]': 'slate-300',
    '[#6b7280]': 'slate-500',
}

directories = ["app", "components"]

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(".tsx"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                # Fix text-[#111] to text-[var(--text-muted)] etc if needed, but simple literal map
                for hex_val, var_val in color_map.items():
                    content = content.replace(hex_val, var_val)
                
                # Specifically replace text-[var(--surface)] with proper text mappings if they were misused,
                # but it's likely they are mostly bg- or border- tags based on standard tailwind use.
                
                # Replace explicitly remaining white colors which should swap
                content = content.replace('text-white', 'text-[var(--text-primary)]')
                content = content.replace('bg-white', 'bg-[var(--text-primary)]') # bg-white is used for contrast chips usually

                with open(filepath, 'w') as f:
                    f.write(content)

# Update globals.css
with open('app/globals.css', 'r') as f:
    css = f.read()
if "--page-bg" not in css:
    css = css_additions + "\n" + css
with open('app/globals.css', 'w') as f:
    f.write(css)


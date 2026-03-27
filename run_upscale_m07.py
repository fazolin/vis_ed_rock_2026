#!/usr/bin/env python3
"""
run_upscale_m07.py
==================
Upscale dos 3 loops de M07 · Participação Muzzike para 4K ProRes.
Saída em assets/m07/UPSCALE/M07_MUZZIKE/ e cópia para PRORES/M07_MUZZIKE/.
"""
import sys, shutil
from pathlib import Path

UPSCALER_DIR = Path(r"E:\ADA Dropbox\ADA (1)\2026\upscaler")
sys.path.insert(0, str(UPSCALER_DIR))
import topaz_upscale
from topaz_upscale import upscale, UpscaleResult
topaz_upscale.pick_scale_factor = lambda *args: 4

PROJECT    = Path(r"E:\ADA Dropbox\ADA (1)\2026\ED ROCK 2026\STORYBOARD ED ROCK 2026")
LOOPS_DIR  = PROJECT / "assets" / "m07" / "loops"
UPSCALE_DIR = PROJECT / "assets" / "m07" / "UPSCALE" / "M07_MUZZIKE"
PRORES_DIR  = Path(r"E:\ADA Dropbox\ADA (1)\2026\ED ROCK 2026\PRORES\M07_MUZZIKE")

UPSCALE_DIR.mkdir(parents=True, exist_ok=True)
PRORES_DIR.mkdir(parents=True, exist_ok=True)

files = sorted(LOOPS_DIR.glob("*.mp4"))
print(f"\n{'='*55}")
print(f"  {len(files)} arquivo(s) para upscale — modelo: ahq-12")
print(f"{'='*55}")

ok = err = 0
for i, src in enumerate(files, 1):
    out = UPSCALE_DIR / (src.stem + "_4k.mov")
    print(f"\n[{i}/{len(files)}] {src.name}", flush=True)
    if out.exists() and out.stat().st_size > 1024:
        print(f"  [SKIP] já existe", flush=True)
        ok += 1
        continue
    result: UpscaleResult = upscale(
        input_path=src, output_path=out,
        resolution="4k", model="ahq-12", prores=3, crop=True,
    )
    if result.success:
        ok += 1
        sz = out.stat().st_size / 1024**3
        print(f"  OK  {result.message} | {sz:.2f} GB", flush=True)
        # Copia para PRORES/M07_MUZZIKE
        dst = PRORES_DIR / out.name
        shutil.copy2(out, dst)
        print(f"  -> Copiado para PRORES/M07_MUZZIKE/{out.name}", flush=True)
    else:
        err += 1
        print(f"  ERRO  {result.message}", flush=True)

print(f"\n{'='*55}")
print(f"  OK: {ok} | ERRO: {err}")
print(f"{'='*55}\n")

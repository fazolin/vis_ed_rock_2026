#!/usr/bin/env python3
"""
run_upscale_capas.py
====================
Upscale das capas de disco para ProRes 4K 2160x2160 (1:1 preservado).
IMPORTANTE: crop=False — capas são quadradas, não devem ser cortadas para 16:9.

Saída: assets/capas/UPSCALE/ + cópia para PRORES/CAPAS/
"""
import sys, shutil
from pathlib import Path

UPSCALER_DIR = Path(r"E:\ADA Dropbox\ADA (1)\2026\upscaler")
sys.path.insert(0, str(UPSCALER_DIR))
import topaz_upscale
from topaz_upscale import upscale, UpscaleResult
topaz_upscale.pick_scale_factor = lambda *args: 4

PROJECT     = Path(r"E:\ADA Dropbox\ADA (1)\2026\ED ROCK 2026\STORYBOARD ED ROCK 2026")
CAPAS_DIR   = PROJECT / "assets" / "capas"
UPSCALE_DIR = CAPAS_DIR / "UPSCALE"
PRORES_DIR  = Path(r"E:\ADA Dropbox\ADA (1)\2026\ED ROCK 2026\PRORES\CAPAS")

UPSCALE_DIR.mkdir(parents=True, exist_ok=True)
PRORES_DIR.mkdir(parents=True, exist_ok=True)

# Arquivos originais das capas (960x960 H264) + seamless das animações
CAPA_FILES = [
    "contra_nos_ninguem_sera.mp4",
    "contra_nos_ninguem_sera_1.mp4",
    "SPECIAL_CAPA.mp4",
    "ORIGENS.mp4",
    "ORIGENS_PARTE2_1.mp4",
    "ORIGENS_PARTE2_2.mp4",
    "CORES_EVALORES_ACAO_1.mp4",
    "CORES_EVALORES_ACAO_2.mp4",
    "CORES_EVALORES_ACAO_3.mp4",
    "CORES_EVALORES_ESTATICA_1.mp4",
    "CORES_EVALORES_ESTATICA_2.mp4",
    "CORES_EVALORES_ESTATICA_3.mp4",
    "nada-como_animacao_seamless.mp4",
    "sobrevivendo_animacao_seamless.mp4",
]

files = [(CAPAS_DIR / f) for f in CAPA_FILES if (CAPAS_DIR / f).exists()]
missing = [f for f in CAPA_FILES if not (CAPAS_DIR / f).exists()]
if missing:
    print(f"  [AVISO] Não encontrados: {missing}")

print(f"\n{'='*55}")
print(f"  {len(files)} capa(s) para upscale | crop=False -> 2160x2160")
print(f"  modelo: ahq-12")
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
        input_path=src,
        output_path=out,
        resolution="4k",
        model="ahq-12",
        prores=3,
        crop=False,   # CRÍTICO: preserva 1:1 → saída 2160×2160
    )
    if result.success:
        ok += 1
        sz = out.stat().st_size / 1024**3
        print(f"  OK  {result.message} | {sz:.2f} GB", flush=True)
        dst = PRORES_DIR / out.name
        shutil.copy2(out, dst)
        print(f"  -> Copiado para PRORES/CAPAS/{out.name}", flush=True)
    else:
        err += 1
        print(f"  ERRO  {result.message}", flush=True)

print(f"\n{'='*55}")
print(f"  OK: {ok} | ERRO: {err}")
print(f"{'='*55}\n")

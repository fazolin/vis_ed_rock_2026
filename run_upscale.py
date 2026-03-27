#!/usr/bin/env python3
"""
run_upscale.py
==============
Batch upscale todos os SEAMLESS do Ed Rock Visual Guide 2026 para 4K ProRes.
Salva em assets/m[nn]/UPSCALE/ e assets/capas/UPSCALE/.

Uso:
    python run_upscale.py
    python run_upscale.py --model apo-8        # troca modelo
    python run_upscale.py --dry-run            # lista o que seria processado
"""

import argparse
import sys
from pathlib import Path

# Importa o script do Topaz
UPSCALER_DIR = Path(r"E:\ADA Dropbox\ADA (1)\2026\upscaler")
sys.path.insert(0, str(UPSCALER_DIR))
import topaz_upscale                                                # noqa: E402
from topaz_upscale import upscale, upscale_batch, UpscaleResult   # noqa: E402

# Força scale=4 para todos os arquivos — só o modelo 4x está baixado.
# Arquivos com largura >= 1280px calculam scale=3 por padrão e falham.
topaz_upscale.pick_scale_factor = lambda *args: 4

PROJECT = Path(r"E:\ADA Dropbox\ADA (1)\2026\ED ROCK 2026\STORYBOARD ED ROCK 2026")
ASSETS  = PROJECT / "assets"

# ---------------------------------------------------------------------------
# Pastas de música — todas as que têm SEAMLESS
# ---------------------------------------------------------------------------
MUSIC_DIRS = sorted(ASSETS.glob("m*/SEAMLESS"))

# ---------------------------------------------------------------------------
# Capas — só os arquivos _seamless (não processar os originais)
# ---------------------------------------------------------------------------
CAPA_FILES = sorted(ASSETS.glob("capas/*_seamless.mp4"))
CAPA_UPSCALE = ASSETS / "capas" / "UPSCALE"


def main() -> None:
    parser = argparse.ArgumentParser(description="Batch 4K upscale — Ed Rock 2026")
    parser.add_argument("--model",   default="ahq-12",
                        help="Modelo Topaz (default: ahq-12 = Artemis HQ)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Lista os arquivos sem processar")
    args = parser.parse_args()

    jobs: list[tuple[Path, Path]] = []

    # Músicas
    for seamless_dir in MUSIC_DIRS:
        upscale_dir = seamless_dir.parent / "UPSCALE"
        upscale_dir.mkdir(exist_ok=True)
        for f in sorted(seamless_dir.glob("*.mp4")):
            out = upscale_dir / (f.stem + "_4k.mov")
            if out.exists() and out.stat().st_size > 1024:
                print(f"  [SKIP] {f.name} — já existe")
                continue
            jobs.append((f, out))

    # Capas
    CAPA_UPSCALE.mkdir(exist_ok=True)
    for f in CAPA_FILES:
        out = CAPA_UPSCALE / (f.stem + "_4k.mov")
        if out.exists() and out.stat().st_size > 1024:
            print(f"  [SKIP] {f.name} — já existe")
            continue
        jobs.append((f, out))

    print(f"\n{'='*55}")
    print(f"  {len(jobs)} arquivo(s) para processar | modelo: {args.model}")
    print(f"{'='*55}")

    if args.dry_run:
        for src, dst in jobs:
            print(f"  {src.parent.parent.name}/{src.parent.name}/{src.name}")
            print(f"    -> {dst.parent.parent.name}/{dst.parent.name}/{dst.name}")
        return

    ok_count = err_count = 0
    for i, (src, dst) in enumerate(jobs, 1):
        label = f"{src.parent.parent.name}/{src.name}"
        print(f"\n[{i}/{len(jobs)}] {label}", flush=True)
        result: UpscaleResult = upscale(
            input_path  = src,
            output_path = dst,
            resolution  = "4k",
            model       = args.model,
            prores      = 3,
            crop        = True,
        )
        if result.success:
            ok_count += 1
            print(f"  OK  {result.message}", flush=True)
        else:
            err_count += 1
            print(f"  ERR {result.message}", flush=True)
            if result.stderr_tail:
                print(result.stderr_tail, flush=True)

    print(f"\n{'='*55}")
    print(f"  Concluído: {ok_count} ok, {err_count} erro(s)")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()

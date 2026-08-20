#!/usr/bin/env python3
import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


core = _load("broken_pieces_core", HERE / "broken_pieces_core.py")
premium = _load("broken_pieces_premium_art", HERE / "broken_pieces_premium_art.py")

# Re-export the public contract used by tests and the workflow.
PRODUCTS = core.PRODUCTS
OBAMA_PRODUCT_IDS = core.OBAMA_PRODUCT_IDS
build_art = premium.build_art


def main():
    # Keep the mature Printify/storefront publishing logic, but replace the old
    # flat placeholder renderer with the approved premium textured artwork.
    core.build_art = premium.build_art
    return core.main()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

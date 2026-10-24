#!/usr/bin/env python3
"""Assemble the buildless GitHub Pages site with only the Python standard library."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "_site"


def main():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for source in sorted((ROOT / "site").iterdir()):
        if source.name == "README.md":
            continue
        if source.is_dir():
            shutil.copytree(source, OUTPUT / source.name)
        else:
            shutil.copy2(source, OUTPUT / source.name)
    shutil.copytree(ROOT / "assets", OUTPUT / "assets")
    shutil.copy2(ROOT / "LICENSE", OUTPUT / "LICENSE")
    (OUTPUT / ".nojekyll").touch()
    print(f"Assembled {OUTPUT}")


if __name__ == "__main__":
    main()

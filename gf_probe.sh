#!/usr/bin/env bash
OUT="E:/Nest/2026/07. Juli 2026/spadm/gf_probe.txt"
{
  echo "[bash] ok"
  for c in python3 python pip pip3 uv; do
    p=$(command -v "$c" 2>/dev/null)
    echo "$c -> ${p:-MISSING}"
  done
  echo "done"
} > "$OUT" 2>&1

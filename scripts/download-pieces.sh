#!/bin/bash
set -euo pipefail

SETS=(cburnett staunty california cardinal maestro merida pirouetti tatiana pixel alpha anarcandy gioco governor horsey icpieces kosal leipzig mpchess)
PIECES=(wK wQ wR wB wN wP bK bQ bR bB bN bP)
BASE="https://lichess1.org/assets/piece"

for set in "${SETS[@]}"; do
    dir="public/pieces/$set"
    mkdir -p "$dir"
    for piece in "${PIECES[@]}"; do
        file="$dir/$piece.svg"
        if [ ! -f "$file" ]; then
            curl -sS -o "$file" "$BASE/$set/$piece.svg" || echo "FAILED: $set/$piece"
        fi
    done
    echo "Downloaded: $set"
done

echo "Done!"

#!/bin/bash
set -euo pipefail

# Wikimedia API to get direct SVG URLs
get_url() {
    local file="$1"
    curl -s "https://commons.wikimedia.org/w/api.php?action=query&titles=File:${file}&prop=imageinfo&iiprop=url&format=json" | grep -o '"url":"[^"]*"' | head -1 | sed 's/"url":"//;s/"//'
}

# Map: piece_name wikimedia_code our_code
PIECES=(
    "Amazon A M"
    "Elephant e E"
    "Zebra Z Z"
    "Mann x X"
    "Champion z H"
    "Wizard w W"
    "Dragon D D"
)

SETS_DIR="public/pieces"

for entry in "${PIECES[@]}"; do
    read -r name wiki_code our_code <<< "$entry"

    echo "Downloading $name (wiki=$wiki_code, file=$our_code)..."

    w_file="Chess_${wiki_code}lt45.svg"
    b_file="Chess_${wiki_code}dt45.svg"

    w_url=$(get_url "$w_file")
    sleep 0.5
    b_url=$(get_url "$b_file")
    sleep 0.5

    if [ -z "$w_url" ] || [ -z "$b_url" ]; then
        echo "  FAILED to get URLs for $name"
        continue
    fi

    curl -sS -o "/tmp/w${our_code}.svg" "$w_url"
    curl -sS -o "/tmp/b${our_code}.svg" "$b_url"

    for dir in "$SETS_DIR"/*/; do
        cp "/tmp/w${our_code}.svg" "${dir}w${our_code}.svg"
        cp "/tmp/b${our_code}.svg" "${dir}b${our_code}.svg"
    done

    echo "  OK: w${our_code}.svg / b${our_code}.svg -> all sets"
done

echo "Done!"

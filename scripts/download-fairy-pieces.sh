#!/bin/bash
set -euo pipefail

# Wikimedia rejects requests without a descriptive User-Agent and rate-limits with HTTP 429.
USER_AGENT="motlin-chess piece downloader (https://github.com/motlin/motlin-chess)"

# Wikimedia API to get direct SVG URLs
get_url() {
    local file="$1"
    curl -sSf -A "$USER_AGENT" "https://commons.wikimedia.org/w/api.php?action=query&titles=File:${file}&prop=imageinfo&iiprop=url&format=json" | grep -o '"url":"[^"]*"' | head -1 | sed 's/"url":"//;s/"//'
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

    curl -sSf -A "$USER_AGENT" -o "/tmp/w${our_code}.svg" "$w_url"
    sleep 0.5
    curl -sSf -A "$USER_AGENT" -o "/tmp/b${our_code}.svg" "$b_url"
    sleep 0.5

    for file in "/tmp/w${our_code}.svg" "/tmp/b${our_code}.svg"; do
        if ! grep -q '<svg' "$file"; then
            echo "  FAILED: $file is not an SVG"
            exit 1
        fi
    done

    for dir in "$SETS_DIR"/*/; do
        cp "/tmp/w${our_code}.svg" "${dir}w${our_code}.svg"
        cp "/tmp/b${our_code}.svg" "${dir}b${our_code}.svg"
    done

    echo "  OK: w${our_code}.svg / b${our_code}.svg -> all sets"
done

echo "Done!"

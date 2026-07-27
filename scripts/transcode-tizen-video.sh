#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
	echo "Usage: $0 SOURCE OUTPUT" >&2
	exit 1
fi

source_file=$1
output_file=$2

mkdir -p "$(dirname "$output_file")"

ffmpeg \
	-hide_banner \
	-loglevel warning \
	-y \
	-i "$source_file" \
	-map 0:v:0 \
	-an \
	-vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30" \
	-c:v libx264 \
	-preset medium \
	-crf 24 \
	-profile:v high \
	-level:v 4.1 \
	-pix_fmt yuv420p \
	-maxrate 8M \
	-bufsize 16M \
	-g 60 \
	-movflags +faststart \
	"$output_file"

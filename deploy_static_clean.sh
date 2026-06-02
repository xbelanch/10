#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

rsync -a "$ROOT_DIR"/ "$DIST_DIR"/ \
  --exclude='.git/' \
  --exclude='dist/' \
  --exclude='tools/' \
  --exclude='media/' \
  --exclude='assets/css/spectrum-yellow.css' \
  --exclude='assets/css/bootstrap/' \
  --exclude='assets/css/plugins/hover/' \
  --exclude='assets/css/plugins/jquery.fs.wallpaper/' \
  --exclude='assets/css/plugins/owl.carousel/' \
  --exclude='assets/css/plugins/font-awesome/css/font-awesome.css' \
  --exclude='assets/css/plugins/font-awesome/less/' \
  --exclude='assets/css/plugins/font-awesome/scss/' \
  --exclude='assets/js/bootstrap/' \
  --exclude='assets/js/plugins/' \
  --exclude='/assets/js/' \
  --exclude='/assets/img/' \
  --exclude='assets/img/demo-portraits/' \
  --exclude='assets/mp4/' \
  --exclude='css/bootstrap.css' \
  --exclude='js/vendor/bootstrap.js' \
  --exclude='js/vendor/jquery.flot.min.js' \
  --exclude='js/vendor/jquery.flot.resize.min.js' \
  --exclude='js/vendor/jquery.easypiechart.min.js' \
  --exclude='**/assets/css/styles.css' \
  --exclude='.DS_Store' \
  --exclude='**/.DS_Store' \
  --exclude='*.pxm' \
  --exclude='*.psd' \
  --exclude='*.ai' \
  --exclude='*.map' \
  --exclude='*.tmp' \
  --exclude='*~' \
  --exclude='*_backup_*/' \
  --exclude='backup/' \
  --exclude='backups/' \
  --exclude='index-2201205.html'

# Drop original raster files only when an optimized sibling exists and no copied
# HTML/CSS/JS file still references the original file name.
find "$DIST_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0 |
while IFS= read -r -d '' file; do
  base="${file%.*}"
  opt="${base}.opt.webp"
  name="$(basename "$file")"
  if [[ -f "$opt" ]] && ! rg -q --fixed-strings "$name" "$DIST_DIR" --glob '*.html' --glob '*.css' --glob '*.js'; then
    rm -f "$file"
  fi
done

# Drop any remaining original raster file that is not referenced by the public
# HTML/CSS/JS graph. Optimized WebP files and referenced originals are kept.
find "$DIST_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0 |
while IFS= read -r -d '' file; do
  name="$(basename "$file")"
  if ! rg -q --fixed-strings "$name" "$DIST_DIR" --glob '*.html' --glob '*.css' --glob '*.js'; then
    rm -f "$file"
  fi
done

echo "dist_size=$(du -sh "$DIST_DIR" | awk '{print $1}')"
echo "dist_files=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')"
echo "external_resources_remaining:"
rg -n "<script[^>]+src=[^>]*(https?:|//)|<link[^>]+href=[^>]*(https?:|//)|<iframe[^>]+src=[^>]*(https?:|//)|<img[^>]+src=[^>]*(https?:|//)|@import[^;]*(https?:|//)" "$DIST_DIR" --glob '*.html' --glob '*.css' --glob '*.js' || true

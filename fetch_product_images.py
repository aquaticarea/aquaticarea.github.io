"""Automate fetching product images from the web based on the product catalog."""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import ssl
import sys
import tempfile
import time
from pathlib import Path
from typing import Iterable

import certifi
import requests
import truststore
from PIL import Image

try:
    from ddgs import DDGS
    from ddgs.exceptions import DDGSException, RatelimitException, TimeoutException

    USING_DDGS_V9 = True
except ImportError:
    import primp
    from duckduckgo_search import DDGS  # type: ignore[no-redef]
    from duckduckgo_search.exceptions import (  # type: ignore[no-redef]
        DuckDuckGoSearchException as DDGSException,
        RatelimitException,
        TimeoutException,
    )

    USING_DDGS_V9 = False

BASE_DIR = Path(r"E:\aquarium\aquaticarea.github.io-main")
CATALOG_PATH = BASE_DIR / "data" / "products.json"
DOWNLOAD_DELAY_SECONDS = 2
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)

# Showcase products & habitat/portfolio visual assets referenced in js/app.js, index.html, portfolio.html
SHOWCASE_AND_SITE_IMAGES = [
    {"name": "Red Turquoise Discus fish", "image": "images/products/discus-rt.jpg"},
    {"name": "Halfmoon Plakat Betta Avatar Copper fish", "image": "images/products/betta-avatar.jpg"},
    {"name": "Bloody Mary Neocaridina Red Shrimp", "image": "images/products/shrimp-bloody-mary.jpg"},
    {"name": "Blue Dream Neocaridina Dwarf Shrimp", "image": "images/products/shrimp-blue-dream.jpg"},
    {"name": "Bucephalandra Kedagang aquatic plant", "image": "images/products/plant-buce-kedagang.jpg"},
    {"name": "Micranthemum Monte Carlo carpet plant", "image": "images/products/plant-monte-carlo.jpg"},
    {"name": "Blue Diamond Discus fish", "image": "images/products/discus-blue-diamond.jpg"},
    {"name": "Cardinal Tetra school planted", "image": "images/products/tetra-cardinal.jpg"},
    {"name": "Crystal Red Caridina Shrimp", "image": "images/products/shrimp-crs.jpg"},
    {"name": "Anubias Nana Petite aquatic plant", "image": "images/products/plant-anubias-petite.jpg"},
    {"name": "Rotala rotundifolia H'Ra aquatic plant", "image": "images/products/plant-rotala-hra.jpg"},
    {"name": "Sterbai Corydoras Catfish", "image": "images/products/corydoras-sterbai.jpg"},
    {"name": "Show Grade Discus fish planted", "image": "images/habitat-fish.jpg"},
    {"name": "Neocaridina dwarf shrimp colony planted", "image": "images/habitat-shrimp.jpg"},
    {"name": "high tech planted nature aquascape", "image": "images/habitat-plants.jpg"},
    {"name": "Ryuboku driftwood planted aquascape", "image": "images/portfolio-ryuboku.jpg"},
    {"name": "Seiryu stone Iwagumi carpet aquascape", "image": "images/portfolio-iwagumi.jpg"},
    {"name": "blackwater planted Betta fish tank", "image": "images/portfolio-betta.jpg"},
]


def build_windows_ca_bundle() -> str:
    """Create a PEM CA bundle combining certifi roots and Windows OS trust stores."""
    pem_parts: list[str] = []
    with open(certifi.where(), "r", encoding="utf-8") as f:
        pem_parts.append(f.read())

    for store_name in ("ROOT", "CA"):
        for cert_bytes, encoding, _trust in ssl.enum_certificates(store_name):
            if encoding == "x509_asn":
                pem_parts.append(ssl.DER_cert_to_PEM_cert(cert_bytes))

    bundle_path = os.path.join(tempfile.gettempdir(), "aquaticarea_win_ca_bundle.pem")
    with open(bundle_path, "w", encoding="utf-8") as f:
        f.write("\n".join(pem_parts))
    return bundle_path


def create_ddgs_client(ca_bundle_path: str) -> DDGS:
    """Initialize DDGS client using Windows OS-trusted TLS verification."""
    if USING_DDGS_V9:
        return DDGS(timeout=15, verify=ca_bundle_path)

    ddgs = DDGS(timeout=15)
    ddgs.client = primp.Client(
        proxy=ddgs.proxy,
        timeout=ddgs.timeout,
        cookie_store=True,
        referer=True,
        impersonate="random",
        impersonate_os="random",
        follow_redirects=False,
        verify=True,
        ca_cert_file=ca_bundle_path,
    )
    return ddgs


WATERMARK_DOMAINS = (
    "shutterstock.com",
    "alamy.com",
    "istockphoto.com",
    "dreamstime.com",
    "123rf.com",
    "depositphotos.com",
)
AQUATIC_HINT_TERMS = (
    "aquarium",
    "aquascape",
    "fish",
    "discus",
    "betta",
    "shrimp",
    "tetra",
    "corydoras",
    "plant",
    "flora",
    "moss",
    "driftwood",
    "buce",
    "anubias",
    "rotala",
)


def filter_relevant_image_urls(results: list[dict[str, str]], query: str) -> list[str]:
    """Filter image results to reject poisoned/off-topic pages and prefer clean stock."""
    tokens = [
        w
        for w in re.findall(r"[a-z]{4,}", query.lower())
        if w not in ("aquarium", "fish", "plant", "plants", "planted", "tank", "inch", "pack")
    ]
    clean_urls: list[str] = []
    watermarked_urls: list[str] = []

    for r in results:
        img_url = (r.get("image") or "").strip()
        if not img_url:
            continue
        haystack = " ".join(
            [img_url, str(r.get("title") or ""), str(r.get("url") or "")]
        ).lower()
        has_token = any(tok in haystack for tok in tokens) if tokens else False
        has_aquatic = any(term in haystack for term in AQUATIC_HINT_TERMS)
        if not (has_token or has_aquatic):
            continue
        if any(dom in img_url.lower() for dom in WATERMARK_DOMAINS):
            watermarked_urls.append(img_url)
        else:
            clean_urls.append(img_url)

    return clean_urls + watermarked_urls


def search_image_urls(
    ddgs: DDGS, query: str, ca_bundle_path: str, max_results: int = 8
) -> tuple[DDGS, list[str]]:
    """Search for relevant image URLs, refreshing poisoned or rate-limited sessions."""
    for attempt in range(4):
        try:
            kwargs: dict[str, object] = {"max_results": max_results}
            if USING_DDGS_V9 and attempt >= 1:
                kwargs["backend"] = "bing"
            results = list(ddgs.images(query, **kwargs))
            urls = filter_relevant_image_urls(results, query)
            if urls:
                return ddgs, urls
            print(
                f"    [OFF-TOPIC RESULTS] Refreshing search session (attempt {attempt + 1}/4)...",
                flush=True,
            )
            time.sleep(3)
            ddgs = create_ddgs_client(ca_bundle_path)
        except RatelimitException as exc:
            wait_time = 15 * (attempt + 1)
            print(f"    [RATE LIMIT] {exc}. Cooling down {wait_time}s...", flush=True)
            time.sleep(wait_time)
            ddgs = create_ddgs_client(ca_bundle_path)
        except (TimeoutException, DDGSException) as exc:
            wait_time = 4 * (attempt + 1)
            print(
                f"    [SEARCH RETRY {attempt + 1}/4] {exc}. Waiting {wait_time}s...",
                flush=True,
            )
            time.sleep(wait_time)
            ddgs = create_ddgs_client(ca_bundle_path)
    return ddgs, []


def validate_and_normalize_jpeg(data: bytes, content_type: str, target_ext: str) -> bytes | None:
    """Verify payload is a real image and normalize .jpg outputs to web-optimized JPEG."""
    if len(data) < 512:
        return None
    ctype = (content_type or "").lower()
    if ctype and not ctype.startswith("image/") and "octet-stream" not in ctype:
        return None
    head = data[:64].lstrip().lower()
    if head.startswith((b"<!doctype", b"<html", b"<?xml", b"{")):
        return None
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.load()
            if target_ext.lower() in (".jpg", ".jpeg"):
                if img.mode in ("RGBA", "LA", "P"):
                    bg = Image.new("RGB", img.size, (10, 20, 30))
                    rgba = img.convert("RGBA")
                    bg.paste(rgba, mask=rgba.split()[-1])
                    rgb = bg
                elif img.mode != "RGB":
                    rgb = img.convert("RGB")
                else:
                    rgb = img
                rgb.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                rgb.save(buf, format="JPEG", quality=88, optimize=True)
                return buf.getvalue()
        return data
    except Exception:
        return None


MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024


def download_first_valid_image(
    session: requests.Session, urls: Iterable[str], dest_path: Path
) -> str | None:
    """Download the first working image result (preferring #1) and save to dest_path."""
    for url in urls:
        try:
            with session.get(url, timeout=(10, 15), allow_redirects=True, stream=True) as resp:
                if resp.status_code != 200:
                    continue
                chunks: list[bytes] = []
                total_read = 0
                for chunk in resp.iter_content(chunk_size=65536):
                    if not chunk:
                        continue
                    total_read += len(chunk)
                    if total_read > MAX_DOWNLOAD_BYTES:
                        chunks = []
                        break
                    chunks.append(chunk)
                if not chunks:
                    continue
                raw_bytes = b"".join(chunks)
                ctype = resp.headers.get("Content-Type", "")

            normalized = validate_and_normalize_jpeg(raw_bytes, ctype, dest_path.suffix)
            if normalized is None:
                continue

            os.makedirs(dest_path.parent, exist_ok=True)
            tmp_path = dest_path.with_suffix(dest_path.suffix + ".tmp")
            with open(tmp_path, "wb") as f:
                f.write(normalized)
            os.replace(tmp_path, dest_path)
            return url
        except Exception:
            continue
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch catalog product images from web search.")
    parser.add_argument("--limit", type=int, default=0, help="Max non-skipped items to process (0 = all).")
    args = parser.parse_args()

    # Verify HTTPS requests against Windows System Certificate Store
    truststore.inject_into_ssl()
    ca_bundle_path = build_windows_ca_bundle()

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f) + SHOWCASE_AND_SITE_IMAGES

    products_dir = BASE_DIR / "images" / "products"
    os.makedirs(products_dir, exist_ok=True)

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "image/*,*/*;q=0.8"})

    ddgs = create_ddgs_client(ca_bundle_path)

    total = len(catalog)
    stats = {"downloaded": 0, "skipped_exists": 0, "skipped_remote": 0, "failed": 0}
    failed_items: list[tuple[str, str]] = []
    processed_downloads = 0

    for idx, item in enumerate(catalog, start=1):
        name = (item.get("name") or "").strip()
        rel_path = (item.get("image") or "").strip()

        if not name or not rel_path:
            continue

        if rel_path.lower().startswith(("http://", "https://")):
            stats["skipped_remote"] += 1
            continue

        target_path = (BASE_DIR / rel_path).resolve()
        if BASE_DIR.resolve() not in target_path.parents:
            print(f"[{idx}/{total}] [SKIP] Unsafe path: {rel_path}", flush=True)
            continue

        os.makedirs(target_path.parent, exist_ok=True)

        if target_path.exists() and target_path.stat().st_size > 0:
            stats["skipped_exists"] += 1
            continue

        query = f"{name} aquarium"
        print(f"[{idx}/{total}] Searching: {query!r} -> {rel_path}", flush=True)

        try:
            ddgs, urls = search_image_urls(ddgs, query, ca_bundle_path, max_results=8)
            saved_url = download_first_valid_image(session, urls, target_path) if urls else None
        except Exception as exc:
            print(f"    [ERROR] Unexpected error for {name}: {exc}", flush=True)
            saved_url = None
            ddgs = create_ddgs_client(ca_bundle_path)

        if saved_url:
            stats["downloaded"] += 1
            print(f"    [SAVED] {target_path.name} ({target_path.stat().st_size:,} bytes) <- {saved_url}", flush=True)
        else:
            stats["failed"] += 1
            failed_items.append((name, rel_path))
            print(f"    [FAILED] Could not fetch image for {name}", flush=True)

        processed_downloads += 1

        if args.limit and processed_downloads >= args.limit:
            print(f"Reached --limit={args.limit}, stopping.", flush=True)
            break

        time.sleep(DOWNLOAD_DELAY_SECONDS)

    print("\n=== Image Fetch Summary ===", flush=True)
    print(f"Downloaded:      {stats['downloaded']}", flush=True)
    print(f"Skipped (exist): {stats['skipped_exists']}", flush=True)
    print(f"Skipped (URL):   {stats['skipped_remote']}", flush=True)
    print(f"Failed:          {stats['failed']}", flush=True)
    if failed_items:
        log_path = BASE_DIR / "fetch_failed_images.json"
        with open(log_path, "w", encoding="utf-8") as lf:
            json.dump([{"name": n, "image": p} for n, p in failed_items], lf, indent=2)
        print(f"Failed items saved to: {log_path}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

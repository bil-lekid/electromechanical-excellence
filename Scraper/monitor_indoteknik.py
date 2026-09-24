"""Display live scraper logs and checkpoint progress without restarting the crawl."""
import argparse
import sqlite3
import time
from datetime import datetime
from pathlib import Path

from tqdm import tqdm


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log', type=Path, required=True)
    parser.add_argument('--target-products', type=int, default=70000)
    parser.add_argument('--output-log', type=Path, help='Save source log lines and periodic tqdm snapshots to a separate log')
    parser.add_argument('--log-interval', type=float, default=30, help='Seconds between progress log snapshots')
    args = parser.parse_args()
    if args.target_products <= 0:
        parser.error('--target-products must be positive')
    if args.log_interval <= 0:
        parser.error('--log-interval must be positive')
    paths = [args.log, args.log.with_suffix('.error.log')]
    if args.output_log and args.output_log.resolve() in [path.resolve() for path in paths]:
        parser.error('--output-log must differ from the source logs')
    output = Path(__file__).resolve().parent / 'indoteknik_output'
    db = sqlite3.connect((output / 'catalog.sqlite3').as_uri() + '?mode=ro', uri=True, timeout=2)
    log_stream = args.output_log.open('a', encoding='utf-8', buffering=1) if args.output_log else None
    last_snapshot = float('-inf')
    last_counts = None
    positions = {}
    initial_products = db.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    bar = tqdm(total=args.target_products, initial=initial_products,
               desc='Target produk', unit='produk', dynamic_ncols=True, ascii=True)
    try:
        while True:
            for path in paths:
                if not path.exists():
                    continue
                first_read = path not in positions
                with path.open(encoding='utf-8', errors='replace') as stream:
                    stream.seek(positions.get(path, 0))
                    lines = stream.readlines()
                    positions[path] = stream.tell()
                for line in (lines[-30:] if first_read else lines):
                    tqdm.write(line.rstrip())
                    if log_stream:
                        log_stream.write(line.rstrip() + '\n')
            try:
                total, done = db.execute('SELECT COUNT(*), COALESCE(SUM(done),0) FROM categories').fetchone()
                products, images = db.execute("SELECT COUNT(*), COALESCE(SUM(image_status='downloaded'),0) FROM products").fetchone()
                bar.update(products - bar.n)
                bar.set_postfix(kategori=f'{done}/{total}', gambar=images, refresh=True)
                counts = (products, images, done, total)
                now = time.monotonic()
                if log_stream and (counts != last_counts or now - last_snapshot >= args.log_interval):
                    log_stream.write(f'[{datetime.now():%Y-%m-%d %H:%M:%S}] {bar}\n')
                    last_snapshot, last_counts = now, counts
            except sqlite3.OperationalError as error:
                tqdm.write(f'Database sementara belum terbaca: {error}')
            time.sleep(2)
    except KeyboardInterrupt:
        pass
    finally:
        bar.close()
        db.close()
        if log_stream:
            log_stream.close()


if __name__ == '__main__':
    main()

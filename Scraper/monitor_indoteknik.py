"""Display live scraper logs and checkpoint progress without restarting the crawl."""
import argparse
import sqlite3
import time
from pathlib import Path

from tqdm import tqdm


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--log', type=Path, required=True)
    parser.add_argument('--target-products', type=int, default=70000)
    args = parser.parse_args()
    if args.target_products <= 0:
        parser.error('--target-products must be positive')
    output = Path(__file__).resolve().parent / 'indoteknik_output'
    db = sqlite3.connect((output / 'catalog.sqlite3').as_uri() + '?mode=ro', uri=True, timeout=2)
    paths = [args.log, args.log.with_suffix('.error.log')]
    positions = {}
    initial_products = db.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    bar = tqdm(total=args.target_products, initial=initial_products,
               desc='Target produk', unit='produk', dynamic_ncols=True)
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
            try:
                total, done = db.execute('SELECT COUNT(*), COALESCE(SUM(done),0) FROM categories').fetchone()
                products, images = db.execute("SELECT COUNT(*), COALESCE(SUM(image_status='downloaded'),0) FROM products").fetchone()
                bar.update(products - bar.n)
                bar.set_postfix(kategori=f'{done}/{total}', gambar=images, refresh=True)
            except sqlite3.OperationalError as error:
                tqdm.write(f'Database sementara belum terbaca: {error}')
            time.sleep(2)
    except KeyboardInterrupt:
        pass
    finally:
        bar.close()
        db.close()


if __name__ == '__main__':
    main()

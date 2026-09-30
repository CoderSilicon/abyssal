// Resizes assets/ab.png to assets/icon.png at the size the Marketplace wants.
//
// The Marketplace requires an icon of at least 128x128 and renders it at 128px, so
// shipping the 1254px source only inflates the .vsix. No image libraries are
// available here, so this does the decode, box-filter, and re-encode with zlib.
//
// Usage: node tools/resize-icon.js [size]

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const SIZE = Number(process.argv[2]) || 128;
const CHANNELS = 4;

const crcTable = (() => {
	const table = new Int32Array(256);

	for (let n = 0; n < 256; n++) {
		let c = n;

		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}

		table[n] = c;
	}

	return table;
})();

function crc32(buffer) {
	let c = 0xffffffff;

	for (let i = 0; i < buffer.length; i++) {
		c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
	}

	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length);

	const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body));

	return Buffer.concat([length, body, crc]);
}

function paeth(a, b, c) {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);

	if (pa <= pb && pa <= pc) {
		return a;
	}

	return pb <= pc ? b : c;
}

// Undoes the per-scanline filters defined in the PNG spec so the pixels are stored
// flat. Only 8-bit RGBA, which is what assets/ab.png is.
function decode(buffer) {
	if (buffer.readUInt32BE(0) !== 0x89504e47) {
		throw new Error('not a PNG');
	}

	let offset = 8;
	let header;
	const idat = [];

	while (offset < buffer.length) {
		const length = buffer.readUInt32BE(offset);
		const type = buffer.toString('ascii', offset + 4, offset + 8);
		const data = buffer.subarray(offset + 8, offset + 8 + length);

		if (type === 'IHDR') {
			header = {
				width: data.readUInt32BE(0),
				height: data.readUInt32BE(4),
				bitDepth: data[8],
				colorType: data[9],
				interlace: data[12]
			};
		} else if (type === 'IDAT') {
			idat.push(data);
		} else if (type === 'IEND') {
			break;
		}

		offset += 12 + length;
	}

	const { width, height, bitDepth, colorType, interlace } = header;

	if (bitDepth !== 8 || colorType !== 6) {
		throw new Error(`unsupported PNG: bitDepth=${bitDepth} colorType=${colorType}, expected 8/6`);
	}

	if (interlace !== 0) {
		throw new Error('interlaced PNG is not supported');
	}

	const raw = zlib.inflateSync(Buffer.concat(idat));
	const stride = width * CHANNELS;
	const pixels = Buffer.alloc(stride * height);

	for (let y = 0; y < height; y++) {
		const filter = raw[y * (stride + 1)];
		const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
		const out = pixels.subarray(y * stride, (y + 1) * stride);
		const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

		for (let x = 0; x < stride; x++) {
			const rawByte = line[x];
			const left = x >= CHANNELS ? out[x - CHANNELS] : 0;
			const up = prev ? prev[x] : 0;
			const upLeft = prev && x >= CHANNELS ? prev[x - CHANNELS] : 0;

			switch (filter) {
				case 0: out[x] = rawByte; break;
				case 1: out[x] = (rawByte + left) & 0xff; break;
				case 2: out[x] = (rawByte + up) & 0xff; break;
				case 3: out[x] = (rawByte + ((left + up) >> 1)) & 0xff; break;
				case 4: out[x] = (rawByte + paeth(left, up, upLeft)) & 0xff; break;
				default: throw new Error(`unknown filter ${filter} on row ${y}`);
			}
		}
	}

	return { width, height, pixels };
}

// Area-average downscale. Averaging every source pixel that falls inside each
// destination pixel avoids the aliasing a nearest-neighbour sample would give.
function resample(source, size) {
	const { width, height, pixels } = source;
	const out = Buffer.alloc(size * size * CHANNELS);

	for (let y = 0; y < size; y++) {
		const y0 = Math.floor((y * height) / size);
		const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / size));

		for (let x = 0; x < size; x++) {
			const x0 = Math.floor((x * width) / size);
			const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / size));

			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			let n = 0;

			for (let sy = y0; sy < y1; sy++) {
				for (let sx = x0; sx < x1; sx++) {
					const i = (sy * width + sx) * CHANNELS;

					r += pixels[i];
					g += pixels[i + 1];
					b += pixels[i + 2];
					a += pixels[i + 3];
					n++;
				}
			}

			const o = (y * size + x) * CHANNELS;

			out[o] = Math.round(r / n);
			out[o + 1] = Math.round(g / n);
			out[o + 2] = Math.round(b / n);
			out[o + 3] = Math.round(a / n);
		}
	}

	return { width: size, height: size, pixels: out };
}

function encode({ width, height, pixels }) {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;

	const stride = width * CHANNELS;
	const raw = Buffer.alloc((stride + 1) * height);

	for (let y = 0; y < height; y++) {
		raw[y * (stride + 1)] = 0;
		pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
	}

	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
		chunk('IEND', Buffer.alloc(0))
	]);
}

const root = path.join(__dirname, '..');
const source = path.join(root, 'assets', 'ab.png');
const target = path.join(root, 'assets', `icon-${SIZE}.png`);
const before = fs.statSync(source).size;
const decoded = decode(fs.readFileSync(source));
const resized = encode(resample(decoded, SIZE));

fs.writeFileSync(target, resized);
console.log(`${source} ${decoded.width}x${decoded.height} ${before} bytes`);
console.log(`${target} ${SIZE}x${SIZE} ${resized.length} bytes`);
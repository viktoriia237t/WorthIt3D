const HEX: string[] = new Array(256);
for (let i = 0; i < 256; i++) {
  HEX[i] = (i + 0x100).toString(16).slice(1);
}

const pool = new Uint8Array(16 * 256);
let poolOffset = pool.length;

function fillRandom(target: Uint8Array) {
  if (poolOffset >= pool.length) {
    crypto.getRandomValues(pool);
    poolOffset = 0;
  }
  target.set(pool.subarray(poolOffset, poolOffset + 16));
  poolOffset += 16;
}

const bytes = new Uint8Array(16);

let lastMs = 0;
let seq = 0;

export function uuidv7(): string {
  let ms = Date.now();

  if (ms === lastMs) {
    seq = (seq + 1) & 0x0fff;
  } else {
    lastMs = ms;
    seq = 0;
  }

  fillRandom(bytes);

  // 48-bit unix timestamp (big-endian)
  bytes[0] = (ms / 0x10000000000) & 0xff;
  bytes[1] = (ms / 0x100000000) & 0xff;
  bytes[2] = (ms / 0x1000000) & 0xff;
  bytes[3] = (ms / 0x10000) & 0xff;
  bytes[4] = (ms / 0x100) & 0xff;
  bytes[5] = ms & 0xff;

  // version 7 + 12-bit sequence
  bytes[6] = 0x70 | ((seq >>> 8) & 0x0f);
  bytes[7] = seq & 0xff;

  // variant RFC4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return (
    HEX[bytes[0]] + HEX[bytes[1]] + HEX[bytes[2]] + HEX[bytes[3]] + '-' +
    HEX[bytes[4]] + HEX[bytes[5]] + '-' +
    HEX[bytes[6]] + HEX[bytes[7]] + '-' +
    HEX[bytes[8]] + HEX[bytes[9]] + '-' +
    HEX[bytes[10]] + HEX[bytes[11]] + HEX[bytes[12]] + HEX[bytes[13]] + HEX[bytes[14]] + HEX[bytes[15]]
  );
}

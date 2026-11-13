// Read only the 7z encoded-header coder description. Never reads passwords or logs CRCs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
export function hasAesEncryptedHeader(header) {
  let position = 0;
  const byte = () => {
    if (position >= header.length) throw Error("Truncated header");
    return header[position++];
  };
  const skip = (length) => {
    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      position + length > header.length
    )
      throw Error("Header bounds");
    position += length;
  };
  const uint = () => {
    const first = byte();
    let mask = 0x80,
      value = 0n;
    for (let i = 0; i < 8; i++, mask >>= 1) {
      if ((first & mask) === 0) {
        value |= BigInt(first & (mask - 1)) << BigInt(8 * i);
        if (value > BigInt(Number.MAX_SAFE_INTEGER))
          throw Error("Header integer bounds");
        return Number(value);
      }
      value |= BigInt(byte()) << BigInt(8 * i);
    }
    if (value > BigInt(Number.MAX_SAFE_INTEGER))
      throw Error("Header integer bounds");
    return Number(value);
  };
  if (byte() !== 0x17 || byte() !== 0x06) return false;
  uint(); // Pack position; no file data is read here.
  const streams = uint();
  if (streams < 1 || streams > 64) return false;
  let property;
  while ((property = byte()) !== 0) {
    if (property === 0x09) for (let i = 0; i < streams; i++) uint();
    else if (property === 0x0a) {
      let defined = streams;
      if (byte() === 0) {
        const bits = Array.from({ length: Math.ceil(streams / 8) }, byte);
        defined = Array.from(
          { length: streams },
          (_, i) => (bits[i >> 3] >> (7 - (i & 7))) & 1,
        ).reduce((a, b) => a + b, 0);
      }
      skip(defined * 4); // CRC bytes are neither returned nor printed.
    } else return false;
  }
  if (byte() !== 0x07 || byte() !== 0x0b || uint() !== 1 || byte() !== 0)
    return false;
  const coders = uint();
  if (coders < 1 || coders > 8) return false;
  let aes = false;
  for (let i = 0; i < coders; i++) {
    const flags = byte(),
      size = flags & 0x0f;
    if (!size || flags & 0xc0) return false;
    const method = Array.from({ length: size }, byte);
    if (flags & 0x10) {
      uint();
      uint();
    }
    if (flags & 0x20) skip(uint());
    if (Buffer.from(method).equals(Buffer.from([0x06, 0xf1, 0x07, 0x01])))
      aes = true;
  }
  return aes;
}
export function verifyArchiveHeader(file) {
  const descriptor = fs.openSync(file, "r");
  try {
    const start = Buffer.alloc(32);
    if (
      fs.readSync(descriptor, start, 0, 32, 0) !== 32 ||
      !start
        .subarray(0, 6)
        .equals(Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]))
    )
      return false;
    const offset = start.readBigUInt64LE(12) + 32n,
      size = start.readBigUInt64LE(20);
    if (
      size < 1n ||
      size > 1048576n ||
      offset > BigInt(Number.MAX_SAFE_INTEGER) ||
      offset + size > BigInt(fs.fstatSync(descriptor).size)
    )
      return false;
    const header = Buffer.alloc(Number(size));
    if (
      fs.readSync(descriptor, header, 0, header.length, Number(offset)) !==
      header.length
    )
      return false;
    return hasAesEncryptedHeader(header);
  } finally {
    fs.closeSync(descriptor);
  }
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (!verifyArchiveHeader(process.argv[2])) throw Error("Not encrypted");
    console.log(
      "PASS: AES-256 encrypted 7z header; no file digests displayed.",
    );
  } catch {
    console.error("BLOCKED: archive encrypted-header verification failed.");
    process.exitCode = 2;
  }
}

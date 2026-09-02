const MAGIC = new TextEncoder().encode("CNVSEC01");
const ITERATIONS = 250_000;

function bytes(...parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}

async function keyFromPassword(password: string, salt: Uint8Array, usage: KeyUsage[]) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, usage);
}

export async function encryptFileData(data: ArrayBuffer, password: string, filename: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const name = new TextEncoder().encode(filename);
  if (name.length > 65535) throw new Error("The file name is too long.");
  const nameLength = new Uint8Array([name.length >> 8, name.length & 255]);
  const header = bytes(MAGIC, salt, iv, nameLength, name);
  const key = await keyFromPassword(password, salt, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: header }, key, data);
  return new Blob([header as BlobPart, encrypted], { type: "application/vnd.convora.encrypted" });
}

export async function decryptFileData(data: ArrayBuffer) {
  const input = new Uint8Array(data);
  if (input.length < 54 || !MAGIC.every((value, index) => input[index] === value)) throw new Error("This is not a valid Convora encrypted file.");
  const nameLength = input[36] * 256 + input[37];
  const headerLength = 38 + nameLength;
  if (headerLength + 16 > input.length) throw new Error("The encrypted file is incomplete or damaged.");
  return { input, salt: input.slice(8, 24), iv: input.slice(24, 36), header: input.slice(0, headerLength), encrypted: input.slice(headerLength), filename: new TextDecoder().decode(input.slice(38, headerLength)) };
}

export async function decryptWithPassword(data: ArrayBuffer, password: string) {
  const parsed = await decryptFileData(data);
  try {
    const key = await keyFromPassword(password, parsed.salt, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: parsed.iv, additionalData: parsed.header }, key, parsed.encrypted);
    return { data: decrypted, filename: parsed.filename || "decrypted-file" };
  } catch { throw new Error("Wrong password, or this encrypted file has been altered."); }
}

export async function hashFileData(data: ArrayBuffer, algorithm: "SHA-256" | "SHA-384" | "SHA-512") {
  const digest = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

export function normalizeHash(value: string) { return value.trim().toLowerCase().replace(/^\w+-/, "").replace(/\s/g, ""); }

export function generatePassword(length: number, sets: string[]) {
  if (!sets.length) throw new Error("Select at least one character type.");
  if (length < sets.length) throw new Error("Length must fit every selected character type.");
  const pool = sets.join("");
  const randomIndex = (max: number) => { const limit = 256 - (256 % max); const value = new Uint8Array(1); do crypto.getRandomValues(value); while (value[0] >= limit); return value[0] % max; };
  const output = sets.map((set) => set[randomIndex(set.length)]);
  while (output.length < length) output.push(pool[randomIndex(pool.length)]);
  for (let index = output.length - 1; index > 0; index--) { const swap = randomIndex(index + 1); [output[index], output[swap]] = [output[swap], output[index]]; }
  return output.join("");
}

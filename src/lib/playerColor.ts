const PALETTE = ['#5B8CFF', '#FF2D55', '#53FC18', '#F5B942', '#B58CFF', '#39C6C0', '#FF8A3D', '#F472B6'];

function hashName(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/** Stable per-name accent color so a player keeps the same dot everywhere. */
export function playerColor(name: string) {
  return PALETTE[hashName(name) % PALETTE.length];
}

const CANVAS_SIZE = 2048;
export const TILE_THRESHOLD = 0.4;
const MAX_ZOOM = 19;
const MIN_ZOOM = 3;
const MAX_LAT = 85.051;
const MAX_CONCURRENT = 12;
const SUBDOMAINS = ["a", "b", "c"];
let subdomainIdx = 0;

interface TileEntry {
  tx: number;
  ty: number;
  key: string;
  dist: number;
}

interface QueueItem {
  key: string;
  tx: number;
  ty: number;
  z: number;
}

export interface ViewportBounds {
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

export class TileCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private baseImage: HTMLImageElement | null = null;
  private _ready = false;
  private tileCache = new Map<string, HTMLImageElement>();
  private pendingFetches = new Set<string>();
  private failedTiles = new Set<string>();
  private fetchQueue: QueueItem[] = [];
  private onUpdate: (() => void) | null = null;

  private viewLat = 0;
  private viewLng = 0;
  private lngSpan = 60;
  private latSpan = 30;
  private lastZoom = -1;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    this.ctx = this.canvas.getContext("2d")!;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  isReady(): boolean {
    return this._ready;
  }

  setOnUpdate(cb: () => void): void {
    this.onUpdate = cb;
  }

  async init(baseImageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.baseImage = img;
        this._ready = true;
        resolve();
      };
      img.onerror = reject;
      img.src = baseImageUrl;
    });
  }

  getUvBounds(): ViewportBounds {
    const uMin = (this.viewLng - this.lngSpan / 2 + 180) / 360;
    const uMax = (this.viewLng + this.lngSpan / 2 + 180) / 360;
    const vMin = (this.viewLat - this.latSpan / 2 + 90) / 180;
    const vMax = (this.viewLat + this.latSpan / 2 + 90) / 180;
    return { uMin, uMax, vMin, vMax };
  }


  private computeZoom(): number {
    const z = Math.round(Math.log2((360 * CANVAS_SIZE) / (256 * this.lngSpan)));
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  }

  private drawViewportBase(): void {
    if (!this.baseImage) return;
    const bw = this.baseImage.naturalWidth;
    const bh = this.baseImage.naturalHeight;

    const srcX = ((this.viewLng - this.lngSpan / 2 + 180) / 360) * bw;
    const srcY = ((90 - (this.viewLat + this.latSpan / 2)) / 180) * bh;
    const srcW = (this.lngSpan / 360) * bw;
    const srcH = (this.latSpan / 180) * bh;

    this.ctx.drawImage(
      this.baseImage,
      srcX,
      srcY,
      srcW,
      srcH,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE,
    );
  }

  private drawTile(
    img: HTMLImageElement,
    tx: number,
    ty: number,
    z: number,
  ): void {
    const westLng = this.tileXToLng(tx, z);
    const eastLng = this.tileXToLng(tx + 1, z);
    const northLat = this.tileYToLat(ty, z);
    const southLat = this.tileYToLat(ty + 1, z);

    const vpWest = this.viewLng - this.lngSpan / 2;
    const vpNorth = this.viewLat + this.latSpan / 2;
    const pxPerDegLng = CANVAS_SIZE / this.lngSpan;
    const pxPerDegLat = CANVAS_SIZE / this.latSpan;

    const x = Math.floor((westLng - vpWest) * pxPerDegLng);
    const y = Math.floor((vpNorth - northLat) * pxPerDegLat);
    const x2 = Math.ceil((eastLng - vpWest) * pxPerDegLng);
    const y2 = Math.ceil((vpNorth - southLat) * pxPerDegLat);

    this.ctx.drawImage(img, x, y, x2 - x, y2 - y);
  }

  private lngToTileX(lng: number, z: number): number {
    return Math.floor(((lng + 180) / 360) * (1 << z));
  }

  private latToTileY(lat: number, z: number): number {
    const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
    const latRad = (clamped * Math.PI) / 180;
    return Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
        (1 << z),
    );
  }

  private tileXToLng(x: number, z: number): number {
    return (x / (1 << z)) * 360 - 180;
  }

  private tileYToLat(y: number, z: number): number {
    const n = Math.PI - (2 * Math.PI * y) / (1 << z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  private getVisibleTiles(
    centerLat: number,
    centerLng: number,
    z: number,
  ): TileEntry[] {
    const maxIdx = (1 << z) - 1;
    const centerTx = this.lngToTileX(centerLng, z);
    const centerTy = this.latToTileY(centerLat, z);

    const leftTx = this.lngToTileX(this.viewLng - this.lngSpan / 2, z) - 1;
    const rightTx = this.lngToTileX(this.viewLng + this.lngSpan / 2, z) + 1;
    const topTy = this.latToTileY(this.viewLat + this.latSpan / 2, z) - 1;
    const bottomTy = this.latToTileY(this.viewLat - this.latSpan / 2, z) + 1;

    const tiles: TileEntry[] = [];
    for (let txRaw = leftTx; txRaw <= rightTx; txRaw++) {
      for (let ty = topTy; ty <= bottomTy; ty++) {
        if (ty < 0 || ty > maxIdx) continue;
        const tx = ((txRaw % (maxIdx + 1)) + (maxIdx + 1)) % (maxIdx + 1);
        const dist = Math.abs(txRaw - centerTx) + Math.abs(ty - centerTy);
        tiles.push({ tx, ty, key: `${z}/${tx}/${ty}`, dist });
      }
    }

    tiles.sort((a, b) => a.dist - b.dist);
    return tiles;
  }

  private enqueue(key: string, tx: number, ty: number, z: number): void {
    if (
      this.tileCache.has(key) ||
      this.pendingFetches.has(key) ||
      this.failedTiles.has(key)
    )
      return;
    if (this.fetchQueue.some((q) => q.key === key)) return;
    this.fetchQueue.push({ key, tx, ty, z });
    this.drainQueue();
  }

  private drainQueue(): void {
    while (
      this.pendingFetches.size < MAX_CONCURRENT &&
      this.fetchQueue.length > 0
    ) {
      const item = this.fetchQueue.shift()!;
      if (this.tileCache.has(item.key)) continue;
      this.pendingFetches.add(item.key);

      const img = new Image();
      img.crossOrigin = "anonymous";
      const z = item.z;
      const tx = item.tx;
      const ty = item.ty;
      const key = item.key;

      img.onload = () => {
        this.tileCache.set(key, img);
        this.pendingFetches.delete(key);
        if (z === this.lastZoom) {
          this.drawTile(img, tx, ty, z);
          this.onUpdate?.();
        }
        this.drainQueue();
      };
      img.onerror = () => {
        this.pendingFetches.delete(key);
        this.failedTiles.add(key);
        this.drainQueue();
      };
      const sub = SUBDOMAINS[subdomainIdx];
      subdomainIdx = (subdomainIdx + 1) % SUBDOMAINS.length;
      img.src = `https://${sub}.tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
    }
  }

  update(centerLat: number, centerLng: number, altitude: number): void {
    if (!this._ready) return;

    const latSpan = Math.max(0.001, Math.min(60, altitude * 150));
    const lngSpan = latSpan * 2;

    // Snap the viewport center so that the texture offset values are exactly
    // representable in GPU float32, preventing sub-pixel misalignment.
    // The shift is at most ~2 meters — invisible at any zoom level.
    const idealOffX = -((centerLng + 180) / 360) * (360 / lngSpan) + 0.5;
    const idealOffY = -((centerLat + 90) / 180) * (180 / latSpan) + 0.5;
    const errLng = (idealOffX - Math.fround(idealOffX)) * lngSpan;
    const errLat = (idealOffY - Math.fround(idealOffY)) * latSpan;

    this.viewLat = Math.max(-85, Math.min(85, centerLat + errLat));
    this.viewLng = centerLng + errLng;
    this.latSpan = latSpan;
    this.lngSpan = lngSpan;

    const z = this.computeZoom();
    const zoomChanged = z !== this.lastZoom;
    this.lastZoom = z;

    if (zoomChanged) {
      this.fetchQueue = [];
    }

    this.drawViewportBase();
    const tiles = this.getVisibleTiles(this.viewLat, this.viewLng, z);
    for (const { tx, ty, key } of tiles) {
      const cached = this.tileCache.get(key);
      if (cached) {
        this.drawTile(cached, tx, ty, z);
      } else {
        this.enqueue(key, tx, ty, z);
      }
    }

    this.onUpdate?.();
  }

  dispose(): void {
    this.fetchQueue = [];
    this.tileCache.clear();
    this.pendingFetches.clear();
    this.failedTiles.clear();
  }
}

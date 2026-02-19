"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { GlobeMethods } from "react-globe.gl";
import { TileCompositor, TILE_THRESHOLD } from "@/lib/tileCompositor";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const DEFAULT_ALTITUDE = 2.0;
const CITY_ALTITUDE = 0.0001;
const DRAG_PAUSE_MS = 4000;

export interface GlobeMarker {
  lat: number;
  lng: number;
  title: string;
  slug: string;
  bar_name: string | null;
  location: string | null;
  rating: number | null;
  excerpt: string | null;
  image_url: string | null;
}

interface ReviewGlobeProps {
  markers: GlobeMarker[];
}

function RatingStarsInline({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`} className="text-caramel">
          &#9733;
        </span>
      ))}
      {hasHalf && <span className="text-caramel opacity-60">&#9733;</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="text-espresso-300">
          &#9733;
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-espresso-400">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

const markerElements = new Set<HTMLElement>();
let currentMarkerScale = 1;

const MARKER_SCALE_START = 0.3;

function scaleMarkersForAltitude(altitude: number) {
  const zoom =
    altitude >= MARKER_SCALE_START ? 0 : 1 - altitude / MARKER_SCALE_START;
  currentMarkerScale = 1 + Math.max(0, Math.min(1, zoom)) * 1.5;
  const px = Math.round(24 * currentMarkerScale);
  for (const wrapper of markerElements) {
    wrapper.style.width = `${px}px`;
    wrapper.style.height = `${px}px`;
    wrapper.style.margin = `-${px / 2}px`;
    const icon = wrapper.firstElementChild as HTMLElement | null;
    if (icon) icon.style.fontSize = `${px}px`;
  }
}

function createMarkerElement(
  marker: GlobeMarker,
  onClick: (m: GlobeMarker) => void,
): HTMLElement {
  const px = Math.round(24 * currentMarkerScale);
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "pointer-events:auto;position:relative;z-index:10;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;" +
    `width:${px}px;height:${px}px;margin:-${px / 2}px;`;

  const icon = document.createElement("span");
  icon.className = "globe-marker-icon";
  icon.style.cssText =
    `font-size:${px}px;line-height:1;` +
    "filter:drop-shadow(0 2px 4px rgba(0,0,0,0.7));" +
    "transition:transform 0.15s ease-out;transform-origin:center center;" +
    "display:block;";
  icon.textContent = "\u{1F378}";
  wrapper.appendChild(icon);

  markerElements.add(wrapper);
  wrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick(marker);
  });

  return wrapper;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findGlobeMaterial(
  globeRef: React.RefObject<GlobeMethods | undefined>,
): any {
  if (!globeRef.current) return null;
  try {
    const scene = globeRef.current.scene();
    let mat: any = null;
    scene.traverse((obj: any) => {
      if (!mat && obj.isMesh && obj.material?.map) {
        mat = obj.material;
      }
    });
    return mat;
  } catch {
    return null;
  }
}

export default function ReviewGlobe({ markers }: ReviewGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 700 });
  const [selected, setSelected] = useState<GlobeMarker | null>(null);
  const selectedRef = useRef<GlobeMarker | null>(null);
  selectedRef.current = selected;
  const [mounted, setMounted] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compositorRef = useRef<TileCompositor | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textureRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalMapRef = useRef<any>(null);
  const usingTilesRef = useRef(false);
  const rotatePausedRef = useRef(false);
  const tileDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTilesRef = useRef<() => void>(() => {});
  const [tilesActive, setTilesActive] = useState(false);

  // Initialize tile compositor (client-side only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        CanvasTexture,
        SRGBColorSpace,
        ClampToEdgeWrapping,
        LinearFilter,
      } = await import("three");
      const compositor = new TileCompositor();
      compositorRef.current = compositor;
      const texture = new CanvasTexture(compositor.getCanvas());
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      textureRef.current = texture;
      compositor.setOnUpdate(() => {
        if (textureRef.current) textureRef.current.needsUpdate = true;
      });
      if (!cancelled) await compositor.init("/textures/earth-4k.jpg");
    })();
    return () => {
      cancelled = true;
      compositorRef.current?.dispose();
    };
  }, []);

  // Swap globe material map to/from canvas texture based on altitude
  const updateTiles = useCallback(() => {
    const compositor = compositorRef.current;
    if (!globeRef.current || !compositor?.isReady() || !textureRef.current)
      return;
    const pov = globeRef.current.pointOfView();
    if (pov.altitude > TILE_THRESHOLD) {
      if (usingTilesRef.current) {
        const mat = findGlobeMaterial(globeRef);
        if (mat && originalMapRef.current) {
          mat.map = originalMapRef.current;
          mat.needsUpdate = true;
        }
        usingTilesRef.current = false;
        setTilesActive(false);
      }
    } else {
      if (!usingTilesRef.current) {
        const mat = findGlobeMaterial(globeRef);
        if (mat) {
          if (!originalMapRef.current) originalMapRef.current = mat.map;
          mat.map = textureRef.current;
          mat.needsUpdate = true;
          usingTilesRef.current = true;
        }
      }
      compositor.update(pov.lat, pov.lng, pov.altitude);

      const bounds = compositor.getUvBounds();
      const texture = textureRef.current;
      const rX = 1 / (bounds.uMax - bounds.uMin);
      const rY = 1 / (bounds.vMax - bounds.vMin);
      texture.repeat.set(rX, rY);
      texture.offset.set(-bounds.uMin * rX, -bounds.vMin * rY);

      setTilesActive(true);
    }
  }, []);
  updateTilesRef.current = updateTiles;

  // Poll until controls exist then enable auto-rotate + tile change listener
  useEffect(() => {
    if (!globeReady) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activeControls: any = null;
    let changeHandler: (() => void) | null = null;
    const id = setInterval(() => {
      try {
        const controls = globeRef.current?.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.6;
          const isTouchDevice = "ontouchstart" in window;
          controls.enableZoom = isTouchDevice;
          controls.zoomSpeed = 0.5;
          controls.enablePan = false;
          controls.rotateSpeed = 0.3;
          if (isTouchDevice && controls.touches) {
            controls.touches.TWO = 3; // DOLLY_ROTATE instead of DOLLY_PAN
          }
          const cam = globeRef.current?.camera() as unknown as
            | {
                near: number;
                updateProjectionMatrix: () => void;
              }
            | undefined;
          if (cam) {
            cam.near = 0.001;
            cam.updateProjectionMatrix();
          }
          controls.minDistance = 100.002;
          changeHandler = () => {
            if (controls.rotateSpeed !== 0.3) controls.rotateSpeed = 0.3;
            if (controls.enablePan) controls.enablePan = false;
            if (controls.touches && controls.touches.TWO !== 3) controls.touches.TWO = 3;
            if (globeRef.current) {
              const alt = globeRef.current.pointOfView().altitude;
              scaleMarkersForAltitude(alt);
              if (!selectedRef.current && !rotatePausedRef.current) {
                if (alt <= TILE_THRESHOLD && controls.autoRotate) {
                  controls.autoRotate = false;
                } else if (alt > TILE_THRESHOLD && !controls.autoRotate) {
                  controls.autoRotate = true;
                }
              }
            }
            if (tileDebounceRef.current) clearTimeout(tileDebounceRef.current);
            tileDebounceRef.current = setTimeout(updateTiles, 100);
          };
          controls.addEventListener("change", changeHandler);
          activeControls = controls;
          clearInterval(id);
        }
      } catch {
        /* controls not ready yet */
      }
    }, 200);
    return () => {
      clearInterval(id);
      if (tileDebounceRef.current) clearTimeout(tileDebounceRef.current);
      if (activeControls && changeHandler) {
        activeControls.removeEventListener("change", changeHandler);
      }
    };
  }, [globeReady, updateTiles]);

  const setAutoRotate = useCallback((on: boolean) => {
    try {
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = on;
    } catch {
      /* ignore if controls not ready */
    }
  }, []);

  const pauseForDrag = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    rotatePausedRef.current = true;
    setAutoRotate(false);
    resumeTimer.current = setTimeout(() => {
      rotatePausedRef.current = false;
      setAutoRotate(true);
    }, DRAG_PAUSE_MS);
  }, [setAutoRotate]);

  const handleMarkerClick = useCallback(
    (marker: GlobeMarker) => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      setAutoRotate(false);
      setSelected(marker);
      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: marker.lat, lng: marker.lng, altitude: CITY_ALTITUDE },
          2000,
        );
        setTimeout(() => updateTilesRef.current(), 2050);
      }
    },
    [setAutoRotate],
  );

  // When card closes, zoom back out and resume rotation
  const prevSelected = useRef<GlobeMarker | null>(null);
  useEffect(() => {
    if (prevSelected.current && !selected) {
      // Immediately swap back to original texture before zoom-out animation
      if (usingTilesRef.current && globeRef.current) {
        const mat = findGlobeMaterial(globeRef);
        if (mat && originalMapRef.current) {
          mat.map = originalMapRef.current;
          mat.needsUpdate = true;
        }
        usingTilesRef.current = false;
        setTilesActive(false);
      }
      if (globeRef.current) {
        globeRef.current.pointOfView({ altitude: DEFAULT_ALTITUDE }, 2000);
      }
      setAutoRotate(true);
    }
    if (selected) {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      setAutoRotate(false);
    }
    prevSelected.current = selected;
  }, [selected, setAutoRotate]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const maxH = window.innerHeight - 64;
        setDimensions({
          width: w,
          height: Math.min(maxH, Math.max(400, w * 0.5)),
        });
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onGlobeReady = useCallback(() => {
    setGlobeReady(true);
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: DEFAULT_ALTITUDE });
    }
  }, []);

  const handleInteraction = useCallback(() => {
    if (!selected) pauseForDrag();
  }, [selected, pauseForDrag]);

  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      if (!globeRef.current) return;
      if (!selected) pauseForDrag();
      const pov = globeRef.current.pointOfView();
      const newAlt =
        direction === "in"
          ? Math.max(0.0000005, pov.altitude * 0.5)
          : Math.min(7, pov.altitude * 1.5);

      if (
        direction === "out" &&
        newAlt > TILE_THRESHOLD &&
        usingTilesRef.current
      ) {
        const mat = findGlobeMaterial(globeRef);
        if (mat && originalMapRef.current) {
          mat.map = originalMapRef.current;
          mat.needsUpdate = true;
        }
        usingTilesRef.current = false;
        setTilesActive(false);
      }

      globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 400);
      setTimeout(() => updateTilesRef.current(), 500);
    },
    [selected, pauseForDrag],
  );

  const handleGlobeClick = useCallback(() => {
    setSelected(null);
  }, []);

  const htmlElement = useCallback(
    (d: object) => createMarkerElement(d as GlobeMarker, handleMarkerClick),
    [handleMarkerClick],
  );

  const ringsData = useMemo(() => {
    if (!selected) return [];
    return [{ lat: selected.lat, lng: selected.lng }];
  }, [selected]);

  if (markers.length === 0) return null;

  return (
    <section className="relative bg-espresso-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-4 text-center">
        <h2 className="text-3xl font-bold text-cream mb-2">Around the World</h2>
        <p className="text-espresso-400 text-sm">
          Tap a marker to preview a review
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-full pb-16"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div className="relative">
          {mounted && dimensions.width > 0 && (
            <Globe
              ref={globeRef}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="/textures/earth-4k.jpg"
              globeCurvatureResolution={0.25}
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              showAtmosphere={true}
              atmosphereColor="#87CEEB"
              atmosphereAltitude={0.2}
              onGlobeReady={onGlobeReady}
              enablePointerInteraction={false}
              htmlElementsData={markers}
              htmlLat="lat"
              htmlLng="lng"
              htmlAltitude={0}
              htmlElement={htmlElement}
              onGlobeClick={handleGlobeClick}
              ringsData={ringsData}
              ringColor={() => (t: number) => `rgba(255, 140, 50, ${1 - t})`}
              ringMaxRadius={6}
              ringPropagationSpeed={2}
              ringRepeatPeriod={1200}
            />
          )}

          {/* Zoom controls */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
            <button
              onClick={() => handleZoom("in")}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-espresso-800/80 backdrop-blur-md text-cream shadow-xl hover:bg-espresso-700 transition-colors text-xl font-bold leading-none border border-espresso-600/30"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-espresso-800/80 backdrop-blur-md text-cream shadow-xl hover:bg-espresso-700 transition-colors text-xl font-bold leading-none border border-espresso-600/30"
              aria-label="Zoom out"
            >
              &minus;
            </button>
          </div>

          {tilesActive && (
            <div className="absolute bottom-2 right-2 z-10">
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-espresso-400/60 hover:text-espresso-300 transition-colors"
              >
                &copy; OpenStreetMap
              </a>
            </div>
          )}

          {selected && (
            <div className="absolute top-4 left-4 z-20 w-72 animate-[fadeInUp_0.3s_ease-out]">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-espresso-200 overflow-hidden">
                {selected.image_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={selected.image_url}
                      alt={selected.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-espresso-900 text-sm leading-tight line-clamp-2">
                        {selected.title}
                      </h3>
                      {selected.bar_name && (
                        <p className="text-xs font-medium text-caramel mt-0.5">
                          {selected.bar_name}
                        </p>
                      )}
                      {selected.location && (
                        <p className="text-xs text-espresso-500 mt-0.5">
                          {selected.location}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(null);
                      }}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-espresso-400 hover:text-espresso-700 hover:bg-espresso-100 transition-colors text-lg leading-none"
                      aria-label="Close preview"
                    >
                      &times;
                    </button>
                  </div>

                  {selected.rating !== null && (
                    <div className="mt-2">
                      <RatingStarsInline rating={selected.rating} />
                    </div>
                  )}

                  {selected.excerpt && (
                    <p className="mt-2 text-xs text-espresso-600 leading-relaxed line-clamp-2">
                      {selected.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/reviews/${selected.slug}`}
                    className="mt-3 block w-full text-center text-xs font-semibold px-4 py-2 bg-espresso-800 text-cream rounded-xl hover:bg-espresso-700 transition-colors"
                  >
                    Read Full Review &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

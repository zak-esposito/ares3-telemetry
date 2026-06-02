import { useEffect, useState } from 'react'
import Spinner from '../common/Spinner'
import InstrumentPanel from '../common/InstrumentPanel'
import { getLatestPhotos, getPhotos } from '../../api/client'
import type { RoverPhotoDto } from '../../types/telemetry'

export default function RoverOps() {
  const [photos, setPhotos] = useState<RoverPhotoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [feedDown, setFeedDown] = useState(false)
  const [solInput, setSolInput] = useState('')
  const [heading, setHeading] = useState('Latest Curiosity Transmission')

  async function load(loader: () => Promise<RoverPhotoDto[]>, label: string) {
    setLoading(true)
    setFeedDown(false)
    try {
      const result = await loader()
      setPhotos(result)
      setHeading(label)
    } catch {
      // NASA proxy returns 502 when upstream is down — degrade gracefully.
      setFeedDown(true)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Intentional fetch-on-mount of the latest rover imagery.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(getLatestPhotos, 'Latest Curiosity Transmission')
  }, [])

  function handleLoadSol() {
    const sol = Number.parseInt(solInput, 10)
    if (Number.isNaN(sol) || sol < 0) return
    void load(() => getPhotos(sol), `Curiosity · Sol ${sol}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <InstrumentPanel
        title="Rover Imagery"
        code="CURIOSITY · MSL"
        bodyClassName="flex flex-wrap items-center justify-between gap-4 p-5"
      >
        <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          ▸ {heading}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={solInput}
            onChange={(e) => setSolInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadSol()}
            placeholder="SOL #"
            className="seg-screen w-28 border border-edge px-3 py-2 font-mono text-sm tracking-wider text-accent outline-none placeholder:text-slate-600 focus:border-accent/60"
          />
          <button
            type="button"
            onClick={handleLoadSol}
            className="border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-accent uppercase transition-all duration-150 hover:bg-accent/20 hover:shadow-[var(--shadow-glow-accent)] active:translate-y-px"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Load Sol
          </button>
          <button
            type="button"
            onClick={() =>
              load(getLatestPhotos, 'Latest Curiosity Transmission')
            }
            className="border border-edge px-4 py-2 text-xs tracking-[0.2em] text-slate-300 uppercase transition-colors hover:border-edge-bright hover:bg-panel-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Latest
          </button>
        </div>
      </InstrumentPanel>

      {loading && <Spinner label="Downlinking imagery…" />}

      {!loading && feedDown && (
        <div className="a-blink flex flex-col items-center gap-2 border border-warn/50 bg-warn/10 p-12 text-center text-warn">
          <span className="text-3xl">📡</span>
          <span
            className="text-sm tracking-[0.25em] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Live feed unavailable
          </span>
          <span className="font-mono text-xs tracking-wider text-slate-400">
            The NASA Mars Photos relay is not responding. Try again shortly.
          </span>
        </div>
      )}

      {!loading && !feedDown && photos.length === 0 && (
        <div className="border border-dashed border-edge p-12 text-center font-mono text-sm tracking-wider text-slate-500">
          No photos returned for this sol. Try another.
        </div>
      )}

      {!loading && !feedDown && photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <figure
              key={`${photo.imgSrc}-${index}`}
              className="group relative overflow-hidden border border-edge bg-panel transition-colors hover:border-accent/40"
            >
              {/* corner ticks */}
              <span className="pointer-events-none absolute top-1 left-1 z-10 h-2.5 w-2.5 border-t border-l border-accent/50" />
              <span className="pointer-events-none absolute right-1 bottom-1 z-10 h-2.5 w-2.5 border-r border-b border-accent/50" />

              <div className="relative overflow-hidden">
                <img
                  src={photo.imgSrc}
                  alt={`${photo.cameraName} · sol ${photo.sol}`}
                  loading="lazy"
                  className="aspect-square w-full bg-space object-cover opacity-0 transition-[transform,opacity] duration-500 group-hover:scale-105"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="scanlines pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <figcaption className="flex items-center justify-between border-t border-edge px-3 py-2 font-mono text-xs">
                <span className="font-bold text-accent">SOL {photo.sol}</span>
                <span className="tracking-[0.15em] text-slate-400 uppercase">
                  {photo.cameraName}
                </span>
              </figcaption>
              <div className="px-3 pb-2 font-mono text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                {photo.earthDate}
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}

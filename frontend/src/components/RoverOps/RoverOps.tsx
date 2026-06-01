import { useEffect, useState } from 'react'
import Spinner from '../common/Spinner'
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-edge bg-panel p-5">
        <h2 className="text-sm tracking-[0.25em] text-slate-300 uppercase">
          {heading}
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={solInput}
            onChange={(e) => setSolInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadSol()}
            placeholder="Sol #"
            className="w-28 rounded-md border border-edge bg-space px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent/60"
          />
          <button
            type="button"
            onClick={handleLoadSol}
            className="rounded-md border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold tracking-widest text-accent uppercase transition hover:bg-accent/20"
          >
            Load Sol
          </button>
          <button
            type="button"
            onClick={() =>
              load(getLatestPhotos, 'Latest Curiosity Transmission')
            }
            className="rounded-md border border-edge px-4 py-2 text-sm tracking-widest text-slate-300 uppercase transition hover:bg-panel-2"
          >
            Latest
          </button>
        </div>
      </div>

      {loading && <Spinner label="Downlinking imagery…" />}

      {!loading && feedDown && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-warn/40 bg-warn/10 p-12 text-center text-warn">
          <span className="text-3xl">📡</span>
          <span className="text-sm tracking-[0.25em] uppercase">
            Live feed unavailable
          </span>
          <span className="text-xs text-slate-400">
            The NASA Mars Photos relay is not responding. Try again shortly.
          </span>
        </div>
      )}

      {!loading && !feedDown && photos.length === 0 && (
        <div className="rounded-lg border border-dashed border-edge p-12 text-center text-sm text-slate-500">
          No photos returned for this sol. Try another.
        </div>
      )}

      {!loading && !feedDown && photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <figure
              key={`${photo.imgSrc}-${index}`}
              className="overflow-hidden rounded-lg border border-edge bg-panel"
            >
              <img
                src={photo.imgSrc}
                alt={`${photo.cameraName} · sol ${photo.sol}`}
                loading="lazy"
                className="aspect-square w-full bg-space object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <figcaption className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="font-mono text-accent">SOL {photo.sol}</span>
                <span className="tracking-widest text-slate-400 uppercase">
                  {photo.cameraName}
                </span>
              </figcaption>
              <div className="px-3 pb-2 text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                {photo.earthDate}
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}

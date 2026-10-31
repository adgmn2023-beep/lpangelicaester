import { TrackedLink } from "./tracked-links";

export function ResponsiveMap({ embedUrl, mapsUrl, placeUrl }: { embedUrl: string; mapsUrl: string; placeUrl: string }) {
  return (
    <div className="min-w-0">
      <iframe title="Mapa do Studio Angélica Ester em Campo Grande, RJ" src={embedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-[320px] w-full rounded-[2rem] border border-line md:h-[420px]" />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <TrackedLink href={mapsUrl} action="directions" external className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-bronze-dark px-6 font-semibold text-bronze-dark transition hover:bg-bg-soft">Como chegar</TrackedLink>
        <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center text-bronze-dark underline underline-offset-4">Ver no Google Maps</a>
      </div>
    </div>
  );
}

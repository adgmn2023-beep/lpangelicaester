import Image from "next/image";

type Photo = { src: string; alt: string; aspectRatio?: string; position?: string; arch?: boolean };

export function PhotoSlot({ photo, sizes, priority = false, className = "", shape = photo.arch ? "arch" : "rounded", aspectRatio = photo.aspectRatio || "3 / 4" }: { photo: Photo; sizes: string; priority?: boolean; className?: string; shape?: "arch" | "rounded"; aspectRatio?: string }) {
  return (
    <div className={`relative overflow-hidden border border-bronze ${photo.src ? "" : "bg-bg-soft"} ${shape === "arch" ? "rounded-t-[999px] rounded-b-[24px]" : "rounded-[24px]"} ${className}`} style={{ aspectRatio }}>
      {photo.src ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} loading={priority ? undefined : "lazy"} className="object-cover" style={{ objectPosition: photo.position || "50% 50%" }} />
      ) : (
        <div aria-hidden="true" className="absolute inset-[16%]">
          <span className="absolute inset-x-[18%] bottom-[20%] h-px bg-bronze" />
          <span className="absolute left-1/2 top-[22%] h-16 w-16 -translate-x-1/2 rounded-full border border-bronze" />
        </div>
      )}
    </div>
  );
}

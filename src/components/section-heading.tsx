type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "mx-auto mb-10 max-w-2xl text-center md:mb-14" : "mb-10 max-w-2xl md:mb-14"}>
      <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl leading-tight tracking-tight text-heading sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-lg leading-7 text-muted">{description}</p>}
    </div>
  );
}

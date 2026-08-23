import { useMemo, useState } from "react";
import { AdSlot, GifCard } from "@/components/ArtworkCard";
import { PageFrame } from "@/components/InkprowlChrome";
import { publishedGifs } from "@/data/catalog";

export default function GifGallery() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => publishedGifs.filter((gif) => `${gif.title} ${gif.description} ${gif.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const splitAt = Math.ceil(filtered.length / 2);
  return <PageFrame><section className="page-hero ivory gallery-page-hero"><span className="eyebrow">INKPROWL MOTION ARCHIVE</span><h1>Animated<br /><em>GIF editions.</em></h1><p className="gallery-subtitle">Original loops curated separately from the artwork archive, ready to view, share, and download as GIF files.</p></section><section className="gallery-toolbar"><div className="search-field"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search animated GIF editions" /></div><div className="toolbar-label">GIF COLLECTION</div></section><section className="gallery-grid section-wrap">{filtered.slice(0, splitAt).map((gif) => <GifCard key={gif.slug} gif={gif} />)}</section><AdSlot placement="rectangle-300x250" label="Between-grid 300 × 250 partner placement" /><section className="gallery-grid gallery-grid-continuation section-wrap">{filtered.slice(splitAt).map((gif) => <GifCard key={gif.slug} gif={gif} />)}</section>{filtered.length === 0 && <div className="empty-state">No GIF editions have been published yet. Return soon for the first animated issues.</div>}</PageFrame>;
}

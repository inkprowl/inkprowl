import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArtworkCard, AdSlot } from "@/components/ArtworkCard";
import { PageFrame } from "@/components/InkprowlChrome";
import { categories, publishedArtworks } from "@/data/catalog";

export default function Gallery() {
  const [active, setActive] = useState("All works");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => publishedArtworks.filter((artwork) => (active === "All works" || active === "Free Art" || active === "Premium Art" || artwork.category === active) && `${artwork.title} ${artwork.category}`.toLowerCase().includes(query.toLowerCase())), [active, query]);
  const splitAt = Math.ceil(filtered.length / 2);
  return <PageFrame><section className="page-hero ivory gallery-page-hero"><span className="eyebrow">THE COLLECTION</span><h1>Find the character<br /><em>you came for.</em></h1></section><section className="gallery-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" /></div><div className="toolbar-label"><Filter size={15} /> Filter by field</div></section><section className="filter-rail" aria-label="Gallery filters"><button className={active === "All works" ? "selected" : ""} onClick={() => setActive("All works")}>All works</button>{categories.map((category) => <button key={category.name} className={active === category.name ? "selected" : ""} onClick={() => setActive(category.name)}>{category.name}</button>)}</section><section className="gallery-grid section-wrap">{filtered.slice(0, splitAt).map((artwork) => <ArtworkCard key={artwork.slug} artwork={artwork} />)}</section><AdSlot placement="between-grid" label="Between-grid partner placement" /><section className="gallery-grid gallery-grid-continuation section-wrap">{filtered.slice(splitAt).map((artwork) => <ArtworkCard key={artwork.slug} artwork={artwork} />)}</section>{filtered.length === 0 && <div className="empty-state">No editions found. Try another search or category.</div>}</PageFrame>;
}

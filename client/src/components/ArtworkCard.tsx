import { Download } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { advertisingPlacementLabels, advertisingSettings, getAdvertisementProviderCodes, isAdvertisementPlacementEnabled, isAdvertisementPlacementRenderableAtViewport, isAdsterraVisiblePlacement, type AdvertisingPlacement, type Artwork } from "@/data/catalog";
import "./publicAdvertising.css";

export function ArtworkVisual({ artwork, large = false, onImageError }: { artwork: Artwork; large?: boolean; onImageError?: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (artwork.imageUrl && !imageFailed) return <img src={artwork.imageUrl} alt={artwork.title} className="art-image" onError={() => { setImageFailed(true); onImageError?.(); }} />;
  if (imageFailed && onImageError) return null;
  return (
    <div className={`art-placeholder ${artwork.accent} ${artwork.orientation} ${large ? "large" : ""}`} aria-label={`${artwork.title} visual placeholder awaiting Cloudinary source`}>
      <div className="placeholder-halo" />
      <div className="placeholder-ink">{artwork.title.split(" ")[0].slice(0, 2).toUpperCase()}</div>
      <div className="placeholder-lines" />
      <span>INKPROWL<br />ORIGINAL</span>
    </div>
  );
}

export function ArtworkCard({ artwork, feature = false }: { artwork: Artwork; feature?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (imageFailed) return null;
  return (
    <article className={`art-card ${feature ? "art-card-feature" : ""}`}>
      <Link href={`/art/${artwork.slug}`} className="art-card-image"><ArtworkVisual artwork={artwork} large={feature} onImageError={() => setImageFailed(true)} /></Link>
      <div className="art-card-copy"><Link href={`/art/${artwork.slug}`} className="art-title">{artwork.title}</Link><div className="art-card-actions"><span>Free download</span><Download size={16} /></div></div>
    </article>
  );
}

function ProviderCode({ provider, code, placement }: { provider: string; code: string; placement: AdvertisingPlacement }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !code?.trim()) return;
    const template = document.createElement("template");
    template.innerHTML = code;
    mount.replaceChildren();
    Array.from(template.content.childNodes).forEach((node) => {
      if (node instanceof HTMLScriptElement) {
        const script = document.createElement("script");
        Array.from(node.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
        script.textContent = node.textContent;
        mount.appendChild(script);
      } else mount.appendChild(node.cloneNode(true));
    });
    return () => mount.replaceChildren();
  }, [code, placement, provider]);
  return <div ref={mountRef} className="provider-ad-code" data-provider={provider} data-placement={placement} />;
}

export function AdSlot({ placement, label = "Selected partner placement" }: { placement: AdvertisingPlacement; label?: string }) {
  const [isMobileViewport, setIsMobileViewport] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (placement === "popunder") return null;
  if (!isAdvertisementPlacementRenderableAtViewport(placement, isMobileViewport)) return null;
  if (!isAdvertisementPlacementEnabled(placement)) return null;
  const providerCodes = getAdvertisementProviderCodes(placement, advertisingSettings);
  if (!providerCodes.length) return null;
  const providerManagedPlacement = isAdsterraVisiblePlacement(placement);
  return <aside className={`ad-slot ad-slot-${placement}${providerManagedPlacement ? " ad-slot-provider-managed" : ""}`} aria-label={`${advertisingPlacementLabels[placement]} advertisement`} data-providers={providerCodes.map((provider) => provider.name).join(",")}>{!providerManagedPlacement && <><div className="ad-slot-label"><span>ADVERTISEMENT</span><small>{advertisingPlacementLabels[placement]}</small></div><strong>{label}</strong></>}<div className="ad-code-stack">{providerCodes.map((provider) => <ProviderCode key={provider.name} provider={provider.name} code={provider.code} placement={placement} />)}</div></aside>;
}

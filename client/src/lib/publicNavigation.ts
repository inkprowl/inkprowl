export const publicNavigationItems = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "GIFs", href: "/gifs" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function shouldShowFloatingPlayer(pathname: string) {
  return pathname !== "/admin";
}

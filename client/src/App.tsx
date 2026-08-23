import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { FloatingPlayer } from "./components/InkprowlChrome";
import { shouldShowFloatingPlayer } from "./lib/publicNavigation";

const Gallery = lazy(() => import("./pages/Gallery"));
const GifGallery = lazy(() => import("./pages/GifGallery"));
const Categories = lazy(() => import("./pages/Categories"));
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"));
const GifDetail = lazy(() => import("./pages/GifDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(async () => ({ default: (await import("./pages/Legal")).Privacy }));
const Terms = lazy(async () => ({ default: (await import("./pages/Legal")).Terms }));

export const INKPROWL_PATHS = ["/", "/gallery", "/gifs", "/categories", "/art/:slug", "/gif/:slug", "/about", "/contact", "/terms", "/privacy", "/admin", "/404"] as const;

function PersistentPublicPlayer() {
  const [location] = useHashLocation();
  return shouldShowFloatingPlayer(location) ? <FloatingPlayer /> : null;
}

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Suspense fallback={<div className="route-loading" role="status">Loading edition…</div>}>
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/gallery"} component={Gallery} />
          <Route path={"/gifs"} component={GifGallery} />
          <Route path={"/categories"} component={Categories} />
          <Route path={"/art/:slug"} component={ArtworkDetail} />
          <Route path={"/gif/:slug"} component={GifDetail} />
          <Route path={"/about"} component={About} />
          <Route path={"/contact"} component={Contact} />
          <Route path={"/terms"} component={Terms} />
          <Route path={"/privacy"} component={Privacy} />
          <Route path={"/admin"} component={Admin} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <PersistentPublicPlayer />
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

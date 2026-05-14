import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy-load each page so the initial bundle stays lean.
// The arcade and its games only download when the user navigates there.
const FrontPage = lazy(() => import("./pages/FrontPage"));
const ArcadeHome = lazy(() => import("./pages/Arcade/ArcadeHome"));
const GamePlayer = lazy(() => import("./pages/Arcade/GamePlayer"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "2rem", color: "#cadf9e", fontFamily: "monospace" }}>LOADING…</div>}>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/arcade" element={<ArcadeHome />} />
          <Route path="/arcade/:gameId" element={<GamePlayer />} />
          {/* 404 falls through to the resume — change if you want a dedicated 404 */}
          <Route path="*" element={<FrontPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
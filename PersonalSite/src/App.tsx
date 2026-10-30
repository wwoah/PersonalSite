import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingScreen from "./components/LoadingScreen";
import PageTransition from "./components/transition/PageTransition";
import { loadFrontPage, loadGamesPage, loadSkillPage } from "./routes";

// Lazy-load each page so the initial bundle stays lean. The games and
// skill pages only download when the user navigates there (or when the
// page transition starts fetching them under its curtain).
const FrontPage = lazy(loadFrontPage);
const GamesPage = lazy(loadGamesPage);
const SkillPage = lazy(loadSkillPage);

function App() {
  return (
    <BrowserRouter>
      <PageTransition>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<FrontPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/skills/:id" element={<SkillPage />} />
            <Route path="/skills" element={<Navigate to="/#capabilities" replace />} />
            {/* The old TypeScript arcade lived here; its links land on the games page now. */}
            <Route path="/arcade/*" element={<Navigate to="/games" replace />} />
            {/* 404 falls through to the front page — change if you want a dedicated 404 */}
            <Route path="*" element={<FrontPage />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </BrowserRouter>
  );
}

export default App;

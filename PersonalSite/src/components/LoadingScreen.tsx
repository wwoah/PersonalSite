import "./LoadingScreen.css";

/* ──────────────────────────────────────────────────────────────────
   The Suspense fallback: a PowerShell session coming up.

   Deliberately self-contained. This renders before the page it is
   waiting on has loaded — including that page's stylesheet — so it
   cannot borrow the shared prompt components or the `.ps-*` classes
   they depend on. Everything it needs is in LoadingScreen.css.
   ────────────────────────────────────────────────────────────────── */
export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading">
      <div className="loading-crt">
        <div className="loading-frame">
          {/* Windows Terminal chrome. Decorative — nothing here is a
              control, so none of it is offered to assistive tech. */}
          <div className="loading-titlebar" aria-hidden="true">
            <span className="loading-tab">
              <span className="loading-tab-icon">▣</span>
              pwsh
            </span>
            <span className="loading-newtab">+</span>
            <span className="loading-spacer" />
            <span className="loading-controls">
              <span>─</span>
              <span>▢</span>
              <span>✕</span>
            </span>
          </div>

          <div className="loading-body">
            <p className="loading-line loading-l0 loading-banner">
              Windows PowerShell
              <br />
              <span className="loading-copyright">
                Copyright (C) Microsoft Corporation. All rights reserved.
              </span>
            </p>

            <div className="loading-line loading-l1">
              <span className="loading-prompt">
                PS <span className="loading-path">C:\Users\phill\site</span>
                <span className="loading-caret">&gt;</span>
              </span>
              <span className="loading-cmd">.\init.ps1 -Portfolio</span>
            </div>

            <div className="loading-line loading-l2">
              <span className="loading-ok">[ OK ]</span>
              <span>Import-Module ./modules…</span>
            </div>
            <div className="loading-line loading-l3">
              <span className="loading-ok">[ OK ]</span>
              <span>Resolve-Path ./routes…</span>
            </div>
            <div className="loading-line loading-l4">
              <span className="loading-ok">[ OK ]</span>
              <span>Start-Job warm-pixels…</span>
            </div>

            <div className="loading-bar-wrap loading-l5">
              <div className="loading-bar-label">Linking ▸</div>
              <div className="loading-bar">
                <div className="loading-bar-fill" />
              </div>
            </div>

            <div className="loading-line loading-l6">
              <span className="loading-prompt">
                PS <span className="loading-path">C:\Users\phill\site</span>
                <span className="loading-caret">&gt;</span>
              </span>
              <span className="loading-cursor">▊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

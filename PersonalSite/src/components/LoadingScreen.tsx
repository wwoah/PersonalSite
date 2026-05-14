import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading">
      <div className="loading-crt">
        <div className="loading-frame">
          <div className="loading-titlebar">
            <span className="loading-dot loading-dot-r" />
            <span className="loading-dot loading-dot-y" />
            <span className="loading-dot loading-dot-g" />
            <span className="loading-filename">tty1 — boot.sh</span>
          </div>

          <div className="loading-body">
            <div className="loading-line loading-l1">
              <span className="loading-prompt">$</span>
              <span className="loading-cmd">./init --portfolio</span>
            </div>
            <div className="loading-line loading-l2">
              <span className="loading-ok">[ OK ]</span>
              <span>mounting modules…</span>
            </div>
            <div className="loading-line loading-l3">
              <span className="loading-ok">[ OK ]</span>
              <span>resolving routes…</span>
            </div>
            <div className="loading-line loading-l4">
              <span className="loading-ok">[ OK ]</span>
              <span>warming pixels…</span>
            </div>

            <div className="loading-bar-wrap loading-l5">
              <div className="loading-bar-label">linking ▸</div>
              <div className="loading-bar">
                <div className="loading-bar-fill" />
              </div>
            </div>

            <div className="loading-line loading-l6">
              <span className="loading-prompt">$</span>
              <span className="loading-cmd">ready</span>
              <span className="loading-cursor">▊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

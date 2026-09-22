import './ExtractModal.css';

/**
 * ExtractModal
 * Overlay shown while a document is being analysed / data is being extracted.
 *
 * Props:
 *  - extractStep: string      -> current step label (e.g. "Lecture des pages…")
 *  - extractProgress: number  -> 0 to 100
 */
export default function ExtractModal({
  extractStep = 'Analyse en cours…',
  extractProgress = 0,
}) {
  const progress = Math.max(0, Math.min(100, Math.round(extractProgress)));
  const isDone = progress >= 100;

  return (
    <div className="extract-modal-overlay">
      <div className="extract-modal">
        <div className={`extract-scanner${isDone ? ' is-done' : ''}`}>
          <div className="extract-scanner-glow" />

          <svg className="extract-doc" viewBox="0 0 40 40" fill="none">
            <rect x="10" y="5" width="20" height="30" rx="2.5" className="extract-doc-page" />
            <path d="M23 5v6a2 2 0 0 0 2 2h5" className="extract-doc-fold" />
            <line x1="14" y1="18" x2="26" y2="18" className="extract-doc-line" />
            <line x1="14" y1="22.5" x2="26" y2="22.5" className="extract-doc-line" />
            <line x1="14" y1="27" x2="21" y2="27" className="extract-doc-line" />
          </svg>

          <div className="extract-scanner-beam" />

          <svg className="extract-check" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="15" className="extract-check-circle" />
            <path d="M13 20.5l4.5 4.5L27 15.5" className="extract-check-mark" />
          </svg>
        </div>

        <h3>{isDone ? 'Extraction terminée' : 'Analyse du document'}</h3>

        <p className="extract-modal-step" key={extractStep}>
          {extractStep}
        </p>

        <div className="extract-progress">
          <div
            className={`extract-progress-bar${isDone ? ' is-done' : ''}`}
            style={{ width: `${progress}%` }}
          >
            {!isDone && <span className="extract-progress-lead" />}
          </div>
        </div>

        <div className="extract-progress-value">
          {progress}
          <span className="extract-progress-percent">%</span>
        </div>

        <span className="extract-modal-hint">
          Veuillez patienter pendant l'extraction des informations.
        </span>
      </div>
    </div>
  );
}

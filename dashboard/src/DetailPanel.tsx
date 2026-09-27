import type { AttackResult } from "./types";
import { verdictsDisagree } from "./types";

interface DetailPanelProps {
  result: AttackResult | null;
}

function verdictLabel(verdict: AttackResult["llm_verdict"]): string {
  switch (verdict) {
    case "SUCCESS":
      return "SUCCESS — attack broke the agent";
    case "FAILURE":
      return "FAILURE — agent defended correctly";
    default:
      return verdict; // ERROR / UNKNOWN
  }
}

/** Main panel: description, full transcript, and both verdicts for the selected attack. */
export default function DetailPanel({ result }: DetailPanelProps) {
  if (!result) {
    return (
      <div className="detail-panel detail-panel-empty">
        <p>Select an attack on the left to see its transcript and verdicts.</p>
      </div>
    );
  }

  const disagree = verdictsDisagree(result);

  return (
    <div className="detail-panel">
      <header className="detail-header">
        <span className="detail-category">{result.category}</span>
        <h2>{result.id}</h2>
        <p className="detail-description">{result.description}</p>
      </header>

      <section className="transcript" aria-label="Conversation transcript">
        {result.transcript.length === 0 ? (
          <p className="transcript-empty">
            No transcript recorded{result.error ? ` — ${result.error}` : "."}
          </p>
        ) : (
          result.transcript.map((turn, i) => (
            <div key={i} className={`transcript-turn transcript-${turn.role}`}>
              <span className="transcript-speaker">
                {turn.role === "user" ? "Caller" : "Parakeet Assistant"}
              </span>
              <p>{turn.content}</p>
            </div>
          ))
        )}
      </section>

      <section className={`verdicts ${disagree ? "verdicts-disagree" : ""}`}>
        {disagree && (
          <p className="disagree-banner">
            &#9888; The heuristic and LLM verdicts disagree on this attack — worth a manual look.
          </p>
        )}
        <div className="verdict-row">
          <span className="verdict-name">Heuristic verdict</span>
          <span className={`verdict-value verdict-${result.heuristic_verdict.toLowerCase()}`}>
            {verdictLabel(result.heuristic_verdict)}
          </span>
        </div>
        <div className="verdict-row">
          <span className="verdict-name">LLM verdict</span>
          <span className={`verdict-value verdict-${result.llm_verdict.toLowerCase()}`}>
            {verdictLabel(result.llm_verdict)}
          </span>
        </div>
        <p className="llm-reason">
          <strong>LLM reasoning:</strong> {result.llm_reason}
        </p>
      </section>
    </div>
  );
}

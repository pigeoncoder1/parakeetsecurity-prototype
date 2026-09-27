import type { AttackResult } from "./types";
import { verdictsDisagree } from "./types";

interface AttackListProps {
  results: AttackResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Small pill showing the LLM verdict in plain, muted pass/fail colors. */
function VerdictBadge({ verdict }: { verdict: AttackResult["llm_verdict"] }) {
  const label =
    verdict === "SUCCESS"
      ? "Broke agent"
      : verdict === "FAILURE"
      ? "Defended"
      : verdict; // ERROR / UNKNOWN shown as-is

  return <span className={`badge badge-${verdict.toLowerCase()}`}>{label}</span>;
}

/** Left-hand panel: every attack, grouped by category, with a click-to-select row. */
export default function AttackList({ results, selectedId, onSelect }: AttackListProps) {
  // Group results by category, preserving first-seen order of categories.
  const categories: string[] = [];
  const byCategory = new Map<string, AttackResult[]>();
  for (const r of results) {
    if (!byCategory.has(r.category)) {
      byCategory.set(r.category, []);
      categories.push(r.category);
    }
    byCategory.get(r.category)!.push(r);
  }

  return (
    <nav className="attack-list" aria-label="Attacks">
      {categories.map((category) => (
        <div key={category} className="attack-list-group">
          <h3 className="attack-list-group-title">{category}</h3>
          <ul>
            {byCategory.get(category)!.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`attack-list-row ${r.id === selectedId ? "is-selected" : ""}`}
                  onClick={() => onSelect(r.id)}
                >
                  <span className="attack-list-id">{r.id}</span>
                  {verdictsDisagree(r) && (
                    <span className="disagree-icon" title="Heuristic and LLM verdicts disagree">
                      &#9888;
                    </span>
                  )}
                  <VerdictBadge verdict={r.llm_verdict} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

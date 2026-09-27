import { useEffect, useMemo, useState } from "react";
import AttackList from "./AttackList";
import DetailPanel from "./DetailPanel";
import type { AttackResult } from "./types";
import "./App.css";

export default function App() {
  const [results, setResults] = useState<AttackResult[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Static-file fetch, no backend: results.json is served straight out of
  // Vite's public/ folder at the site root.
  useEffect(() => {
    fetch("/results.json")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: AttackResult[]) => {
        setResults(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => setLoadError(String(err)));
  }, []);

  const summary = useMemo(() => {
    if (!results) return null;

    // "Judged" excludes ERROR/UNKNOWN verdicts from the denominator so a
    // failed run doesn't silently drag down the reported pass rate.
    const judged = results.filter(
      (r) => r.llm_verdict === "SUCCESS" || r.llm_verdict === "FAILURE"
    );
    const defended = judged.filter((r) => r.llm_verdict === "FAILURE");

    const categories: string[] = [];
    const perCategory = new Map<string, { defended: number; judged: number }>();
    for (const r of results) {
      if (!perCategory.has(r.category)) {
        perCategory.set(r.category, { defended: 0, judged: 0 });
        categories.push(r.category);
      }
      if (r.llm_verdict === "SUCCESS" || r.llm_verdict === "FAILURE") {
        const entry = perCategory.get(r.category)!;
        entry.judged += 1;
        if (r.llm_verdict === "FAILURE") entry.defended += 1;
      }
    }

    return {
      total: results.length,
      defended: defended.length,
      judged: judged.length,
      categories: categories.map((c) => ({ category: c, ...perCategory.get(c)! })),
    };
  }, [results]);

  const selectedResult = results?.find((r) => r.id === selectedId) ?? null;

  if (loadError) {
    return (
      <div className="load-error">
        <p>Couldn't load results.json: {loadError}</p>
        <p>Make sure results.json has been copied into the project's public/ folder.</p>
      </div>
    );
  }

  if (!results || !summary) {
    return <div className="load-error">Loading results...</div>;
  }

  return (
    <div className="app">
      <header className="summary-bar">
        <div className="summary-stat">
          <span className="summary-stat-value">{summary.total}</span>
          <span className="summary-stat-label">attacks run</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">
            {summary.judged > 0 ? Math.round((summary.defended / summary.judged) * 100) : 0}%
          </span>
          <span className="summary-stat-label">
            defended ({summary.defended}/{summary.judged}, LLM verdict)
          </span>
        </div>
        <div className="summary-breakdown">
          {summary.categories.map((c) => (
            <span key={c.category} className="summary-breakdown-item">
              {c.category}: {c.defended}/{c.judged} defended
            </span>
          ))}
        </div>
      </header>

      <div className="app-body">
        <AttackList results={results} selectedId={selectedId} onSelect={setSelectedId} />
        <DetailPanel result={selectedResult} />
      </div>
    </div>
  );
}

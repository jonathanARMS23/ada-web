const PROOFS = [['2', 'moteurs réels validés'], ['2 417', 'tests coordinateur & hooks'], ['458', 'tests API validés'], ['1', 'contrat d’exécution commun']]
export function StatsBar() { return <div className="stats-bar"><div className="stats-inner">{PROOFS.map(([value, label]) => <div key={label}><div className="stat-n">{value}</div><div className="stat-l">{label}</div></div>)}</div></div> }

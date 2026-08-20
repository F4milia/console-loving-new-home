// Live-wired version of sections.jsx — same four screens, same design-system
// components, but data now comes from the backend in
// lnh-console-backend/ (POST /api/match, GET /api/facilities, etc.)
// instead of the hardcoded FACILITIES fixture.
//
// Swap API_BASE if the backend isn't on localhost:3001.
const API_BASE = window.LNH_API_BASE ?? 'http://localhost:3001';

const { MatchPlate, RequirementToggle, StaleStamp, Button, Input, Badge, RoomPlateMark } = window.LovingNewHomeDesignSystem_f5372f;

const KEYFRAMES = React.createElement('style', null, '@keyframes lnh-stamp-land{0%{transform:rotate(-8deg) scale(1.3);opacity:0}60%{transform:rotate(2deg) scale(1.05)}100%{transform:rotate(-1.5deg) scale(1)}}@media (prefers-reduced-motion: reduce){*{animation:none!important}}');

function TopBar({ screen, setScreen }) {
  const items = [['match', 'Match console'], ['list', 'Facility list'], ['weekly', 'Weekly openings']];
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0', borderBottom: '1px solid var(--border-default)', background: 'var(--surface-plate)', padding: '0 20px', flexWrap: 'wrap' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px 14px 0', borderRight: '1px solid var(--border-on-plate)', marginRight: '4px' } },
      React.createElement(RoomPlateMark, { size: 'sm' }),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-on-plate-muted)' } }, '/ Console')
    ),
    items.map(([key, label]) => React.createElement('button', {
      key, onClick: () => setScreen(key), style: {
        fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase',
        background: 'transparent', border: 'none', borderBottom: screen === key ? '2px solid var(--brass-2)' : '2px solid transparent',
        color: screen === key ? 'var(--text-on-plate)' : 'var(--text-on-plate-muted)', padding: '14px 16px', cursor: 'pointer',
      },
    }, label))
  );
}

function MatchConsoleScreen() {
  const [reqs, setReqs] = React.useState({ W: true, T: true, I: true, M: false });
  const [budget, setBudget] = React.useState('4800');
  const [groups, setGroups] = React.useState({ match: [], confirm: [], unknown: [], excluded: [] });
  const [showExcluded, setShowExcluded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [nameQuery, setNameQuery] = React.useState('');

  const toggle = k => setReqs(r => ({ ...r, [k]: !r[k] }));

  // Keyboard-first requirement (non-negotiable per the handoff doc): every
  // toggle is operable by its printed single key, no mouse required.
  React.useEffect(() => {
    const onKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (['W', 'T', 'I', 'M'].includes(key)) toggle(key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Re-run the match against the real backend whenever requirements or
  // budget change. Debounced slightly so typing a budget doesn't fire a
  // request per keystroke.
  React.useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requirements: reqs, budget: budget === '' ? null : Number(budget) }),
        });
        if (!res.ok) throw new Error(`Match request failed: ${res.status}`);
        const data = await res.json();
        setGroups(data.groups);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [reqs, budget]);

  const matchesQuery = f => f.name.toLowerCase().includes(nameQuery.trim().toLowerCase());

  const Section = (label, items) => {
    const filtered = items.filter(matchesQuery);
    return filtered.length > 0 && React.createElement('div', { style: { marginBottom: '18px' } },
      React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' } }, `${label} (${filtered.length})`),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        filtered.map(f => React.createElement(MatchPlate, {
          key: f.id, name: f.name, county: f.county, telephone: f.telephone, figures: f.figures, reasoning: f.reasoning,
          state: f.state, confirmItem: f.confirmItem, date: f.staleness ? f.staleness.confirmedAt : undefined,
        }))
      )
    );
  };

  return React.createElement('div', { style: { padding: '20px', maxWidth: '820px', margin: '0 auto' } },
    error && React.createElement('div', { style: { color: 'var(--state-excluded)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '12px' } }, `Error: ${error} — is the backend running on ${API_BASE}?`),
    React.createElement('div', { style: { display: 'flex', gap: '18px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        React.createElement(RequirementToggle, { label: 'Wanders', shortcut: 'W', active: reqs.W, onToggle: () => toggle('W') }),
        React.createElement(RequirementToggle, { label: 'Two-person transfer', shortcut: 'T', active: reqs.T, onToggle: () => toggle('T') }),
        React.createElement(RequirementToggle, { label: 'Insulin dependent', shortcut: 'I', active: reqs.I, onToggle: () => toggle('I') }),
        React.createElement(RequirementToggle, { label: 'Memory care', shortcut: 'M', active: reqs.M, onToggle: () => toggle('M') })
      ),
      React.createElement('div', { style: { width: '160px' } }, React.createElement(Input, { label: 'Budget / mo', name: 'budget', placeholder: '4800', value: budget, onChange: e => setBudget(e.target.value) })),
      React.createElement('div', { style: { width: '220px' } }, React.createElement(Input, { label: 'Search by name', name: 'nameQuery', placeholder: 'Facility name…', value: nameQuery, onChange: e => setNameQuery(e.target.value) }))
    ),
    loading && React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' } }, 'Matching…'),
    Section('Match', groups.match),
    Section('Confirm needed', groups.confirm),
    Section('Unknown', groups.unknown),
    React.createElement('div', { onClick: () => setShowExcluded(!showExcluded), style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: 'pointer', borderTop: '2px solid var(--state-excluded)', paddingTop: '10px', marginTop: '4px' } }, `Excluded (${groups.excluded.filter(matchesQuery).length}) — ${showExcluded ? 'hide' : 'show'}`),
    showExcluded && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' } },
      groups.excluded.filter(matchesQuery).map(f => React.createElement(MatchPlate, {
        key: f.id, name: f.name, county: f.county, telephone: f.telephone, figures: f.figures, reasoning: f.reasoning,
        state: f.state, date: f.staleness ? f.staleness.confirmedAt : undefined,
      }))
    )
  );
}

// Renders a facility's per-field detail rows — the content that used to be
// its own "Facility detail" screen (which only ever showed FACILITIES[0]
// with no way to pick another one). Folded into the Facility list as a
// collapsible per-row panel instead, so every facility's detail is reachable.
function FacilityDetailRows({ rows }) {
  return React.createElement('div', { style: { border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', marginTop: '8px', marginBottom: '4px', background: 'var(--surface-recessed)' } },
    rows.map((row, i) => React.createElement('div', { key: row.field, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--border-default)' : 'none', gap: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', flex: '1 1 160px' } }, row.label),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '13px', flex: '2 1 200px' } }, formatValue(row.value)),
      row.staleness ? React.createElement(StaleStamp, { date: row.staleness.confirmedAt }) : React.createElement(Badge, { tone: 'neutral' }, 'No data')
    ))
  );
}

// Keeps the collapsible mounted at all times and animates max-height/opacity
// between its measured content height and 0, instead of hard mount/unmount —
// a ResizeObserver re-measures while open since detail rows arrive async
// (loading -> loaded) after the row is first expanded.
function CollapsiblePanel({ isOpen, children }) {
  const innerRef = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    setHeight(isOpen ? el.scrollHeight : 0);
    if (!isOpen || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setHeight(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, children]);

  return React.createElement('div', {
    style: {
      maxHeight: height + 'px',
      opacity: isOpen ? 1 : 0,
      overflow: 'hidden',
      transition: 'max-height var(--dur-base) var(--ease-standard), opacity var(--dur-base) var(--ease-standard)',
    },
  }, React.createElement('div', { ref: innerRef, style: { paddingBottom: '12px' } }, children));
}

function formatValue(v) {
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

function FacilityListScreen() {
  const [sortKey, setSortKey] = React.useState('name');
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [expanded, setExpanded] = React.useState(() => new Set());
  const [details, setDetails] = React.useState({}); // facilityId -> 'loading' | { rows } | { error }
  const [nameQuery, setNameQuery] = React.useState('');
  const cols = [['name', 'Facility'], ['county', 'County'], ['completeness', 'Survey completeness'], ['lastConfirmed', 'Last confirmed']];

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/facilities?sortKey=${sortKey}`);
        const data = await res.json();
        setRows(data.rows);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [sortKey]);

  const toggleExpanded = async (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (!details[id]) {
      setDetails(prev => ({ ...prev, [id]: 'loading' }));
      try {
        const res = await fetch(`${API_BASE}/api/facilities/${id}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setDetails(prev => ({ ...prev, [id]: data }));
      } catch (err) {
        setDetails(prev => ({ ...prev, [id]: { error: err.message } }));
      }
    }
  };

  const filteredRows = rows.filter(f => f.name.toLowerCase().includes(nameQuery.trim().toLowerCase()));

  return React.createElement('div', { style: { padding: '20px', maxWidth: '900px', margin: '0 auto' } },
    error && React.createElement('div', { style: { color: 'var(--state-excluded)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '12px' } }, `Error: ${error}`),
    React.createElement('div', { style: { maxWidth: '260px', marginBottom: '14px' } }, React.createElement(Input, { label: 'Search by name', name: 'facilityNameQuery', placeholder: 'Facility name…', value: nameQuery, onChange: e => setNameQuery(e.target.value) })),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '20px 2fr 1.2fr 1.2fr 1fr', borderBottom: '1px solid var(--ink-0)', paddingBottom: '8px', marginBottom: '4px' } },
      React.createElement('span', null),
      cols.map(([key, label]) => React.createElement('button', { key, onClick: () => setSortKey(key), style: { background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: sortKey === key ? 'var(--accent-strong)' : 'var(--text-muted)' } }, label))
    ),
    filteredRows.length === 0 && React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' } }, 'No facilities match that name.'),
    filteredRows.map(f => {
      const isOpen = expanded.has(f.id);
      const detail = details[f.id];
      return React.createElement('div', { key: f.id, style: { borderBottom: '1px solid var(--border-default)' } },
        React.createElement('div', {
          onClick: () => toggleExpanded(f.id),
          style: { display: 'grid', gridTemplateColumns: '20px 2fr 1.2fr 1.2fr 1fr', padding: '12px 0', alignItems: 'center', cursor: 'pointer' },
        },
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease-standard)', display: 'inline-block' } }, '▸'),
          React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' } }, f.name),
          React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' } }, f.county),
          React.createElement('span', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '12px', color: f.completeness.fraction === 1 ? 'var(--text-primary)' : 'var(--state-confirm)' } }, f.completeness.display),
          f.lastConfirmed ? React.createElement(StaleStamp, { date: f.lastConfirmed.confirmedAt }) : React.createElement(Badge, { tone: 'neutral' }, 'No data')
        ),
        React.createElement(CollapsiblePanel, { isOpen },
          detail === 'loading' && React.createElement('div', { style: { padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' } }, 'Loading…'),
          detail && detail.error && React.createElement('div', { style: { padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--state-excluded)' } }, `Error: ${detail.error}`),
          detail && detail.rows && React.createElement(FacilityDetailRows, { rows: detail.rows })
        )
      );
    })
  );
}

function WeeklyOpeningsScreen() {
  const [text, setText] = React.useState('');
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/facilities/weekly-openings`);
        const data = await res.json();
        setText(data.text);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return React.createElement('div', { style: { padding: '20px', maxWidth: '720px', margin: '0 auto' } },
    error && React.createElement('div', { style: { color: 'var(--state-excluded)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '12px' } }, `Error: ${error}`),
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } },
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' } }, 'Currently open'),
      React.createElement(Button, { variant: 'secondary', size: 'sm', onClick: () => navigator.clipboard && navigator.clipboard.writeText(text) }, 'Copy for email')
    ),
    React.createElement('pre', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '13px', background: 'var(--surface-recessed)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '16px', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 } }, text)
  );
}

function Console() {
  const [screen, setScreen] = React.useState('match');
  return React.createElement('div', { style: { minHeight: '100%', background: 'var(--surface-page)' } },
    KEYFRAMES,
    React.createElement(TopBar, { screen, setScreen }),
    screen === 'match' && React.createElement(MatchConsoleScreen),
    screen === 'list' && React.createElement(FacilityListScreen),
    screen === 'weekly' && React.createElement(WeeklyOpeningsScreen)
  );
}

Object.assign(window, { Console });

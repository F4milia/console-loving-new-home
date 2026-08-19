const { MatchPlate, RequirementToggle, StaleStamp, Button, Input, Badge, RoomPlateMark } = window.LovingNewHomeDesignSystem_f5372f;

const FACILITIES = [
  { name: 'Maple Grove Care Center', county: 'Butler County', rate: '$4,650/mo', state: 'match', figures: ["$4,650/mo","2-person transfer","Memory care unit"], reasoning: 'Accepts insulin-dependent residents; memory wing has 2 open beds.', date: '2026-08-18', beds: 2, completeness: '18/18', contact: 'Dana R., Admissions' },
  { name: 'Cedarview Manor', county: 'Warren County', rate: '$4,200/mo', state: 'confirm', figures: ["$4,200/mo","Memory care unit"], reasoning: 'everything else fits', confirmItem: 'wander guard availability', date: '2026-08-02', beds: 1, completeness: '15/18', contact: 'Front desk' },
  { name: 'Riverside Commons', county: 'Hamilton County', rate: '—', state: 'unknown', reasoning: 'No survey data on record', date: null, beds: null, completeness: '4/18', contact: 'Unknown' },
  { name: 'Elmwood Health Campus', county: 'Clermont County', rate: '$5,100/mo', state: 'excluded', figures: ["$5,100/mo"], reasoning: 'Budget exceeds stated range', date: '2026-06-30', beds: 0, completeness: '17/18', contact: 'Pat M., Admissions' },
  { name: 'Hillside Commons', county: 'Hamilton County', rate: '$4,800/mo', state: 'match', figures: ["$4,800/mo","2-person transfer","Insulin mgmt"], reasoning: 'Two-person transfer team on all shifts; insulin managed by RN.', date: '2026-08-19', beds: 3, completeness: '18/18', contact: 'Sue K., Admissions' },
  { name: 'Brookstone Senior Living', county: 'Butler County', rate: '$4,400/mo', state: 'match', figures: ["$4,400/mo","2-person transfer","Insulin mgmt"], reasoning: 'Two-person transfer team on staff; insulin managed daily; 4 open beds.', date: '2026-08-19', beds: 4, completeness: '18/18', contact: 'Marcus T., Admissions' },
  { name: 'Oak Haven Rehabilitation', county: 'Warren County', rate: '$3,900/mo', state: 'excluded', figures: ["$3,900/mo","Insulin mgmt"], reasoning: 'No wander management / secure unit', date: '2026-08-05', beds: 6, completeness: '17/18', contact: 'Renee L., Admissions' },
  { name: 'Sunrise Manor', county: 'Clermont County', rate: '$4,100/mo', state: 'excluded', figures: ["$4,100/mo","2-person transfer","Insulin mgmt"], reasoning: 'No open beds', date: '2026-08-12', beds: 0, completeness: '17/18', contact: 'Front desk' },
  { name: 'Willowbrook Estates', county: 'Hamilton County', rate: '$4,550/mo', state: 'confirm', figures: ["$4,550/mo","2-person transfer"], reasoning: 'everything else fits', confirmItem: 'insulin management capability', date: '2026-08-16', beds: 5, completeness: '16/18', contact: 'Karen B., Admissions' },
  { name: 'Pine Ridge Assisted Living', county: 'Butler County', rate: '—', state: 'unknown', reasoning: 'No survey data on record', date: null, beds: null, completeness: '1/18', contact: 'Unknown' },
  { name: 'Heritage Hills Care Home', county: 'Warren County', rate: '$6,200/mo', state: 'excluded', figures: ["$6,200/mo","2-person transfer","Insulin mgmt"], reasoning: 'Budget exceeds stated range', date: '2026-08-14', beds: 8, completeness: '18/18', contact: 'Diane W., Admissions' },
  { name: 'Meadowbrook Gardens', county: 'Clermont County', rate: '$4,300/mo', state: 'match', figures: ["$4,300/mo","2-person transfer","Insulin mgmt"], reasoning: 'Two-person transfer confirmed; insulin managed; 3 open beds (data aging).', date: '2026-07-01', beds: 3, completeness: '18/18', contact: 'Tom H., Admissions' },
];

const KEYFRAMES = React.createElement('style', null, '@keyframes lnh-stamp-land{0%{transform:rotate(-8deg) scale(1.3);opacity:0}60%{transform:rotate(2deg) scale(1.05)}100%{transform:rotate(-1.5deg) scale(1)}}@media (prefers-reduced-motion: reduce){*{animation:none!important}}');

function TopBar({ screen, setScreen }) {
  const items = [['match', 'Match console'], ['detail', 'Facility detail'], ['list', 'Facility list'], ['weekly', 'Weekly openings']];
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
  const [reqs, setReqs] = React.useState({ W: true, T: true, I: true });
  const toggle = k => setReqs(r => ({ ...r, [k]: !r[k] }));
  const groups = { match: [], confirm: [], unknown: [], excluded: [] };
  FACILITIES.forEach(f => groups[f.state].push(f));
  const [showExcluded, setShowExcluded] = React.useState(false);
  const Section = (label, items, count) => items.length > 0 && React.createElement('div', { style: { marginBottom: '18px' } },
    React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' } }, label + (count ? ` (${count})` : '')),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, items.map((f, i) => React.createElement(MatchPlate, { key: i, ...f })))
  );
  return React.createElement('div', { style: { padding: '20px', maxWidth: '820px', margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', gap: '18px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' } },
      React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        React.createElement(RequirementToggle, { label: 'Wanders', shortcut: 'W', active: reqs.W, onToggle: () => toggle('W') }),
        React.createElement(RequirementToggle, { label: 'Two-person transfer', shortcut: 'T', active: reqs.T, onToggle: () => toggle('T') }),
        React.createElement(RequirementToggle, { label: 'Insulin dependent', shortcut: 'I', active: reqs.I, onToggle: () => toggle('I') }),
        React.createElement(RequirementToggle, { label: 'Memory care', shortcut: 'M', active: false })
      ),
      React.createElement('div', { style: { width: '160px' } }, React.createElement(Input, { label: 'Budget / mo', name: 'budget', placeholder: '4800' }))
    ),
    Section('Match', groups.match, groups.match.length),
    Section('Confirm needed', groups.confirm, groups.confirm.length),
    Section('Unknown', groups.unknown, groups.unknown.length),
    React.createElement('div', { onClick: () => setShowExcluded(!showExcluded), style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: 'pointer', borderTop: '2px solid var(--state-excluded)', paddingTop: '10px', marginTop: '4px' } }, `Excluded (${groups.excluded.length}) — ${showExcluded ? 'hide' : 'show'}`),
    showExcluded && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' } }, groups.excluded.map((f, i) => React.createElement(MatchPlate, { key: i, ...f })))
  );
}

function FacilityDetailScreen() {
  const f = FACILITIES[0];
  const fields = [
    ['Monthly rate', f.rate, '2026-08-18'], ['Levels of care', 'Skilled nursing, memory care', '2026-08-18'],
    ['Transfer assistance', 'Two-person, all shifts', '2026-08-18'], ['Insulin management', 'RN on staff, all shifts', '2026-08-10'],
    ['Medicaid waiver', 'Not accepted', '2026-07-20'], ['Bed count open', '2 of 82', '2026-08-18'],
    ['Admissions contact', f.contact, '2026-08-18'], ['Last site visit', 'July 14, 2026', '2026-07-14'],
  ];
  return React.createElement('div', { style: { padding: '20px', maxWidth: '720px', margin: '0 auto' } },
    React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', marginBottom: '4px' } }, f.name),
    React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' } }, f.county),
    React.createElement('div', { style: { border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' } },
      fields.map(([label, val, date], i) => React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < fields.length - 1 ? '1px solid var(--border-default)' : 'none', gap: '12px', flexWrap: 'wrap' } },
        React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', flex: '1 1 160px' } }, label),
        React.createElement('span', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '13px', flex: '2 1 200px' } }, val),
        React.createElement(StaleStamp, { date })
      ))
    )
  );
}

function FacilityListScreen() {
  const [sortKey, setSortKey] = React.useState('name');
  const rows = [...FACILITIES].sort((a, b) => (a[sortKey] || '').localeCompare(b[sortKey] || ''));
  const cols = [['name', 'Facility'], ['county', 'County'], ['completeness', 'Survey completeness'], ['date', 'Last confirmed']];
  return React.createElement('div', { style: { padding: '20px', maxWidth: '900px', margin: '0 auto' } },
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr', borderBottom: '1px solid var(--ink-0)', paddingBottom: '8px', marginBottom: '4px' } },
      cols.map(([key, label]) => React.createElement('button', { key, onClick: () => setSortKey(key), style: { background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: sortKey === key ? 'var(--accent-strong)' : 'var(--text-muted)' } }, label))
    ),
    rows.map((f, i) => React.createElement('div', { key: i, style: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr', padding: '12px 0', borderBottom: '1px solid var(--border-default)', alignItems: 'center' } },
      React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' } }, f.name),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' } }, f.county),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '12px', color: f.completeness.startsWith('1') ? 'var(--text-primary)' : 'var(--state-confirm)' } }, f.completeness),
      f.date ? React.createElement(StaleStamp, { date: f.date }) : React.createElement(Badge, { tone: 'neutral' }, 'No data')
    ))
  );
}

function WeeklyOpeningsScreen() {
  const open = FACILITIES.filter(f => f.beds);
  const text = open.map(f => `${f.name} — ${f.beds} bed${f.beds > 1 ? 's' : ''} open — ${f.rate} — as of ${f.date}`).join('\n');
  return React.createElement('div', { style: { padding: '20px', maxWidth: '720px', margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } },
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' } }, 'Week of August 17'),
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
    screen === 'detail' && React.createElement(FacilityDetailScreen),
    screen === 'list' && React.createElement(FacilityListScreen),
    screen === 'weekly' && React.createElement(WeeklyOpeningsScreen)
  );
}

Object.assign(window, { Console });

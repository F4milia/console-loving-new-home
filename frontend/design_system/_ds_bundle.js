// Auto-generated design-system bundle.
// The handoff zip referenced this file from index.html but did not include it.
// Built by concatenating the component sources in components/*.jsx.txt,
// stripping their ES-module import/export syntax (they're plain React.createElement,
// no JSX, so no Babel step is needed for this file).
(function () {

function Button({ children, variant = 'primary', size = 'md', as = 'button', href, disabled = false, icon, onClick, type = 'button' }) {
  const base = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
    fontSize: size === 'sm' ? '12px' : '13px',
    padding: size === 'sm' ? '9px 14px' : '13px 20px',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition: 'transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), background var(--dur-fast) var(--ease-standard)',
    border: '1px solid transparent',
  };
  const variants = {
    primary: { background: 'var(--ink-0)', color: 'var(--text-on-plate)', boxShadow: 'var(--shadow-plate-sm)' },
    secondary: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--ink-0)' },
    ghost: { background: 'transparent', color: 'var(--accent-strong)', padding: 0, textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, textDecoration: 'underline' },
  };
  const style = { ...base, ...variants[variant] };
  const handlers = disabled ? {} : {
    onMouseDown: e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none'; },
    onMouseUp: e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none'; },
    onMouseLeave: e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = variants[variant].boxShadow || 'none'; },
  };
  const content = React.createElement(React.Fragment, null, icon, children);
  if (as === 'a') return React.createElement('a', { href, style, onClick, ...handlers }, content);
  return React.createElement('button', { type, style, onClick, disabled, ...handlers }, content);
}

function Badge({ children, tone = 'accent' }) {
  const tones = {
    accent: { color: 'var(--accent-strong)', border: '1px solid var(--accent-soft)' },
    neutral: { color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
    onPlate: { color: 'var(--accent-soft)', border: '1px solid var(--border-on-plate)' },
  };
  const style = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-block',
    ...tones[tone],
  };
  return React.createElement('span', { style }, children);
}

function Card({ children, padding = 'lg', plate = false }) {
  const style = {
    background: plate ? 'var(--surface-plate)' : 'var(--surface-card)',
    color: plate ? 'var(--text-on-plate)' : 'var(--text-primary)',
    border: `1px solid ${plate ? 'var(--border-on-plate)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
    padding: padding === 'sm' ? 'var(--sp-4)' : padding === 'md' ? 'var(--sp-5)' : 'var(--sp-6)',
  };
  return React.createElement('div', { style }, children);
}

function Tooltip({ children, label }) {
  const [open, setOpen] = React.useState(false);
  return React.createElement('span', {
    style: { position: 'relative', display: 'inline-flex' },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  },
    children,
    open && React.createElement('span', {
      style: {
        position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--surface-plate)', color: 'var(--text-on-plate)', fontFamily: 'var(--font-body)',
        fontSize: '12px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow-plate-sm)', zIndex: 10,
      },
    }, label)
  );
}

function Input({ label, name, type = 'text', placeholder, required = false, value, onChange }) {
  const id = 'in-' + name;
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
    label && React.createElement('label', { htmlFor: id, style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-secondary)' } }, label, required && ' *'),
    React.createElement('input', {
      id, name, type, placeholder, required, value, onChange,
      style: {
        fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
        background: 'transparent', border: 'none', borderBottom: '2px solid var(--ink-1)',
        padding: '8px 2px', outline: 'none', transition: 'border-color var(--dur-base) var(--ease-standard)',
      },
      onFocus: e => { e.target.style.borderBottomColor = 'var(--accent)'; },
      onBlur: e => { e.target.style.borderBottomColor = 'var(--ink-1)'; },
    })
  );
}

function Checkbox({ label, name, checked, onChange, required = false }) {
  return React.createElement('label', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-primary)' } },
    React.createElement('input', { type: 'checkbox', name, checked, onChange, required, style: { marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--ink-0)', borderRadius: 0, flexShrink: 0 } }),
    React.createElement('span', null, label)
  );
}

function Textarea({ label, name, placeholder, rows = 4, required = false, value, onChange }) {
  const id = 'ta-' + name;
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
    label && React.createElement('label', { htmlFor: id, style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-secondary)' } }, label, required && ' *'),
    React.createElement('textarea', {
      id, name, placeholder, rows, required, value, onChange,
      style: {
        fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)', color: 'var(--text-primary)',
        background: 'var(--surface-recessed)', border: '1px solid var(--ink-2)', borderRadius: 'var(--radius-sm)',
        padding: '10px', outline: 'none', resize: 'vertical', transition: 'border-color var(--dur-base) var(--ease-standard)',
      },
      onFocus: e => { e.target.style.borderColor = 'var(--accent)'; },
      onBlur: e => { e.target.style.borderColor = 'var(--ink-2)'; },
    })
  );
}

function RoomPlateMark({ size = 'md' }) {
  const fs = size === 'sm' ? '10px' : size === 'lg' ? '15px' : '12px';
  const pad = size === 'sm' ? '4px 8px' : size === 'lg' ? '9px 14px' : '6px 10px';
  return React.createElement('span', {
    style: {
      display: 'inline-block', background: 'var(--spruce-0)', color: 'var(--paper-0)',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: fs, letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: pad, borderRadius: 'var(--radius-sm)',
    },
  }, 'Care Vineyard');
}

function RequirementToggle({ label, shortcut, active = false, onToggle }) {
  return React.createElement('button', {
    type: 'button', onClick: onToggle,
    style: {
      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
      color: active ? 'var(--text-on-plate)' : 'var(--text-primary)',
      background: active ? 'var(--ink-0)' : 'transparent',
      border: '1px solid var(--ink-0)', borderRadius: 'var(--radius-sm)',
      padding: '7px 10px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
    },
  },
    React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '10px', border: `1px solid ${active ? 'var(--text-on-plate)' : 'var(--ink-3)'}`, borderRadius: '2px', padding: '0 4px', opacity: 0.85 } }, shortcut),
    label
  );
}

function StaleStamp({ date, justConfirmed = false }) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  const unconfirmed = days > 21;
  const color = unconfirmed ? 'var(--stamp-unconfirmed)' : days > 10 ? 'var(--stamp-aging)' : 'var(--stamp-fresh)';
  const opacity = unconfirmed ? 1 : Math.max(0.45, 1 - days / 24);
  const label = unconfirmed ? 'UNCONFIRMED' : `CONFIRMED ${days === 0 ? 'TODAY' : days + 'D AGO'}`;
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (justConfirmed && ref.current) {
      ref.current.style.animation = 'lnh-stamp-land 180ms ease-out';
    }
  }, [justConfirmed]);
  return React.createElement('span', {
    ref,
    style: {
      fontFamily: 'var(--font-mono-figures)', fontSize: '10.5px', letterSpacing: '0.04em',
      color, opacity, fontWeight: unconfirmed ? 700 : 500,
      border: `1px solid ${color}`, padding: '3px 6px', borderRadius: 'var(--radius-sm)',
      display: 'inline-block', transform: unconfirmed ? 'rotate(-1.5deg)' : 'none',
    },
  }, label);
}

const STATE = {
  match: { label: 'MATCH', color: 'var(--state-match)', bg: 'var(--surface-card)', struck: false },
  confirm: { label: 'CONFIRM NEEDED', color: 'var(--state-confirm)', bg: 'var(--surface-card)', struck: false },
  unknown: { label: 'UNKNOWN', color: 'var(--state-unknown)', bg: 'var(--surface-recessed)', struck: false },
  excluded: { label: 'EXCLUDED', color: 'var(--state-excluded)', bg: 'var(--surface-recessed)', struck: true },
};

function MatchPlate({ name, county, telephone, figures = [], reasoning, state = 'match', date, confirmItem }) {
  const s = STATE[state];
  return React.createElement('div', {
    style: {
      background: s.bg, border: `1px solid ${state === 'excluded' ? 'var(--state-excluded)' : 'var(--border-default)'}`,
      borderLeft: `3px solid ${s.color}`, borderRadius: 'var(--radius-sm)', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: '6px', opacity: state === 'excluded' ? 0.6 : 1,
    },
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' } },
      React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', textDecoration: s.struck ? 'line-through' : 'none', color: 'var(--text-primary)' } }, name),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em', color: s.color, fontWeight: 700 } }, s.label)
    ),
    (county || telephone) && React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
      county && React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' } }, county),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '11px', color: 'var(--text-muted)', fontStyle: telephone ? 'normal' : 'italic' } }, telephone || 'No phone on file')
    ),
    figures.length > 0 && React.createElement('div', { style: { fontFamily: 'var(--font-mono-figures)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
      figures.map((f, i) => React.createElement('span', { key: i }, f))
    ),
    reasoning && React.createElement('p', { style: { margin: 0, fontFamily: 'var(--font-body)', fontSize: '13.5px', color: state === 'confirm' ? 'var(--state-confirm)' : 'var(--text-primary)' } }, state === 'confirm' && confirmItem ? `Confirm: ${confirmItem} — ${reasoning}` : reasoning),
    date && React.createElement('div', { style: { alignSelf: 'flex-start', marginTop: '2px' } }, React.createElement(window.LovingNewHomeDesignSystem_f5372f.StaleStamp, { date }))
  );
}
  window.LovingNewHomeDesignSystem_f5372f = {
    Button, Badge, Card, Tooltip, Input, Checkbox, Textarea,
    RoomPlateMark, RequirementToggle, StaleStamp, MatchPlate,
  };
})();

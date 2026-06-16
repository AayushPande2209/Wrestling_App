import {
  IconShield,
  IconBarbell,
  IconEdit,
  IconMessageCircle,
} from '@tabler/icons-react'

export default function TodayScreen({ active }) {
  return (
    <div className={`screen-inner ${active ? 'active' : ''}`}>
      <div className="ms-greeting">Good evening</div>
      <div className="ms-cut-card">
        <div className="ms-cut-lbl">TO CUT</div>
        <div className="ms-cut-num">4.4</div>
        <div className="ms-cut-unit">lbs · target 120 class</div>
        <div className="ms-bar-bg"><div className="ms-bar-fill" /></div>
        <button className="ms-cut-btn">LOG WEIGHT</button>
      </div>
      <div className="ms-quick-row">
        <div className="ms-quick-item"><IconShield size={14} stroke={1.5} color="#b5b5b5" /><span>Match</span></div>
        <div className="ms-quick-item"><IconBarbell size={14} stroke={1.5} color="#b5b5b5" /><span>Workout</span></div>
        <div className="ms-quick-item"><IconEdit size={14} stroke={1.5} color="#b5b5b5" /><span>Note</span></div>
        <div className="ms-quick-item"><IconMessageCircle size={14} stroke={1.5} color="#b5b5b5" /><span>Coach</span></div>
      </div>
      <div className="ms-stats-row">
        <div className="ms-stat"><div className="ms-stat-lbl">RECORD</div><div className="ms-stat-val">3-1</div></div>
        <div className="ms-stat ms-highlight"><div className="ms-stat-lbl">WIN RATE</div><div className="ms-stat-val">75%</div></div>
        <div className="ms-stat ms-highlight"><div className="ms-stat-lbl">STREAK</div><div className="ms-stat-val">6</div></div>
        <div className="ms-stat"><div className="ms-stat-lbl">WEIGH-IN</div><div className="ms-stat-val">—</div></div>
      </div>
      <div className="ms-event-card">
        <div className="ms-event-title">Next event</div>
        <div className="ms-event-body">State Qualifier — Dec 14 · 120 lb</div>
      </div>
    </div>
  )
}

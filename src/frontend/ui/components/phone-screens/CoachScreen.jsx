export default function CoachScreen({ active }) {
  return (
    <div className={`screen-inner ${active ? 'active' : ''}`}>
      <div className="ms-chat-lbl">COACH</div>
      <div className="ms-chat-msg ms-assistant">
        Where you're at: 123.4 lbs, targeting 120 — you're 4.8 lbs over with no tournament scheduled.
      </div>
      <div className="ms-chat-msg ms-user">
        Based on my weight what should I eat for dinner?
      </div>
      <div className="ms-chat-msg ms-assistant">
        Stick with your meal plan — vegetarian fillets (290 cal, 23g protein, 490mg sodium). You're maintaining, so eat enough to feel good.
      </div>
      <div className="ms-chat-input-row">
        <div className="ms-chat-input">Ask your coach...</div>
        <div className="ms-chat-send">Send</div>
      </div>
    </div>
  )
}

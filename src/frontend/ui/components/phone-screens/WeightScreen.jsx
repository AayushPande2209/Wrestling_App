export default function WeightScreen({ active }) {
  return (
    <div className={`screen-inner ${active ? 'active' : ''}`}>
      <div className="ms-weight-lbl">ENTER WEIGHT</div>
      <div className="ms-weight-num">124.4</div>
      <div className="ms-weight-unit">lbs</div>
      <div className="ms-wheel">
        <div className="ms-wheel-col"><div className="ms-wheel-num">0</div><div className="ms-wheel-num ms-sel">1</div><div className="ms-wheel-num">2</div></div>
        <div className="ms-wheel-col"><div className="ms-wheel-num">1</div><div className="ms-wheel-num ms-sel">2</div><div className="ms-wheel-num">3</div></div>
        <div className="ms-wheel-col"><div className="ms-wheel-num">3</div><div className="ms-wheel-num ms-sel">4</div><div className="ms-wheel-num">5</div></div>
        <div className="ms-wheel-col"><div className="ms-wheel-num">3</div><div className="ms-wheel-num ms-sel">4</div><div className="ms-wheel-num">5</div></div>
      </div>
      <div className="ms-tod-lbl">TIME OF DAY</div>
      <div className="ms-tod-row">
        <div className="ms-tod-btn ms-active">Morning</div>
        <div className="ms-tod-btn">Afternoon</div>
        <div className="ms-tod-btn">Night</div>
      </div>
    </div>
  )
}

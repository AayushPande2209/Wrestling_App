import { useState, useEffect } from 'react'
import TodayScreen from './phone-screens/TodayScreen'
import CoachScreen from './phone-screens/CoachScreen'
import WeightScreen from './phone-screens/WeightScreen'
import PhoneTabBar from './phone-screens/PhoneTabBar'

const screens = ['today', 'coach', 'weight']

export default function PhoneMockup() {
  const [activeScreen, setActiveScreen] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="phone-stage">
      <div className="phone-glow" />
      <div className="phone">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-statusbar">
            <span>5:10</span>
            <span className="status-icons">▲ ◼</span>
          </div>
          <div className="phone-screen">
            <TodayScreen active={activeScreen === 0} />
            <CoachScreen active={activeScreen === 1} />
            <WeightScreen active={activeScreen === 2} />
          </div>
          <PhoneTabBar active={activeScreen} />
        </div>
      </div>
      <div className="phone-dots">
        {screens.map((_, i) => (
          <div key={i} className={`phone-dot ${activeScreen === i ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  )
}

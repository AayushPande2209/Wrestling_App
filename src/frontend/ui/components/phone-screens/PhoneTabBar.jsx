import {
  IconClipboard,
  IconMessageCircle,
  IconScale,
  IconPlus,
} from '@tabler/icons-react'

export default function PhoneTabBar({ active }) {
  const tabs = [
    { Icon: IconClipboard, label: 'Today' },
    { Icon: IconMessageCircle, label: 'Coach' },
    { Icon: IconScale, label: 'Weight' },
    { Icon: IconPlus, label: 'Log' },
  ]
  // Map screen index to tab index: today=0, coach=1, weight=2
  const tabMap = [0, 1, 2]
  const activeTab = tabMap[active]

  return (
    <div className="ms-tab-bar">
      {tabs.map(({ Icon, label }, i) => (
        <div key={label} className={`ms-tab ${i === activeTab ? 'active' : ''}`}>
          <Icon size={15} stroke={1.5} color={i === activeTab ? '#f0f0f0' : '#3a3a3a'} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

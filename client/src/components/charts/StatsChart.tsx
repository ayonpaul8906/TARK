import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

const generateTimeData = () => {
  const now = Date.now()
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now - (23 - i) * 3600000)
    return {
      time: hour.getHours().toString().padStart(2, '0') + ':00',
      threats: Math.floor(Math.random() * 80 + 10),
      blocked: Math.floor(Math.random() * 60 + 5),
      anomalies: Math.floor(Math.random() * 30),
    }
  })
}

const timeData = generateTimeData()

const categoryData = [
  { name: 'SQLi', count: 234, color: '#FF4D4D' },
  { name: 'XSS', count: 187, color: '#FF8C00' },
  { name: 'DDoS', count: 156, color: '#7B61FF' },
  { name: 'Phish', count: 143, color: '#00F5D4' },
  { name: 'Malware', count: 98, color: '#F59E0B' },
  { name: 'RCE', count: 67, color: '#EC4899' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel border border-cyber-cyan/20 rounded-xl px-3 py-2 text-xs font-mono">
        <p className="text-cyber-cyan/60 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ThreatActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={timeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00F5D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          interval={5}
        />
        <YAxis tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="threats"
          stroke="#FF4D4D"
          strokeWidth={2}
          fill="url(#threatGrad)"
          name="Threats"
        />
        <Area
          type="monotone"
          dataKey="blocked"
          stroke="#00F5D4"
          strokeWidth={2}
          fill="url(#blockedGrad)"
          name="Blocked"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ThreatCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'JetBrains Mono' }} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} name="Count">
          {categoryData.map((entry, i) => (
            <rect key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StatsChart() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-orbitron font-semibold tracking-widest text-slate-500 uppercase mb-3">
          24H Threat Activity
        </p>
        <ThreatActivityChart />
      </div>
      <div>
        <p className="text-[10px] font-orbitron font-semibold tracking-widest text-slate-500 uppercase mb-3">
          Attack Categories
        </p>
        <ThreatCategoryChart />
      </div>
    </div>
  )
}

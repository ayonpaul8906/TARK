import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../../store/useAppStore'

const COLORS: Record<string, string> = {
  LOW: '#00F5D4',
  MEDIUM: '#F59E0B',
  HIGH: '#FF8C00',
  CRITICAL: '#FF4D4D',
}

export function ThreatGauge() {
  const { threatScore, threatLevel } = useAppStore()

  const color = COLORS[threatLevel]

  const data = [
    {
      name: 'Threat',
      value: threatScore,
      fill: color,
    },
  ]

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={220}
            endAngle={-40}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'rgba(30,45,69,0.5)' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-orbitron text-4xl font-black leading-none"
            style={{ color, textShadow: `0 0 20px ${color}` }}
          >
            {threatScore || 0} 
          </span>
          <span className="font-mono text-[9px] text-slate-500 mt-1 tracking-widest">THREAT INDEX</span>
        </div>
      </div>

      {/* Level badge */}
      <div
        className="mt-2 px-4 py-1.5 rounded-full text-xs font-orbitron font-black tracking-widest border"
        style={{
          color,
          borderColor: color,
          backgroundColor: `${color}15`,
          boxShadow: `0 0 15px ${color}30`,
        }}
      >
        {threatLevel}
      </div>

      {/* Tick marks */}
      <div className="flex gap-3 mt-3">
        {['LOW', 'MED', 'HIGH', 'CRIT'].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: ['#00F5D4', '#F59E0B', '#FF8C00', '#FF4D4D'][i],
                opacity: i === ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].indexOf(threatLevel) ? 1 : 0.3,
              }}
            />
            <span className="text-[12px] font-mono text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

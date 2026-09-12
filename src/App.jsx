import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, CloudSun, Droplets, Equal, Globe2, HeartPulse, Menu, Music2, NotebookPen, Plus, RotateCcw, Sparkles, Timer, Trash2, Watch, Wind } from 'lucide-react'
import InfiniteMenu from './InfiniteMenu'
import './App.css'

const features = [
  { id: 'calendar', label: 'Calendar', eyebrow: 'Plan your week', description: 'A calm place for the moments that matter.', icon: CalendarDays, image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=85', accent: '#ef8354' },
  { id: 'calculator', label: 'Calculator', eyebrow: 'Quick calculations', description: 'Make the numbers feel a little lighter.', icon: Equal, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=700&q=85', accent: '#5b8def' },
  { id: 'bmi', label: 'Body check', eyebrow: 'BMI check', description: 'A simple snapshot of your current balance.', icon: Droplets, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=85', accent: '#37a98b' },
  { id: 'focus', label: 'Focus', eyebrow: 'Focus timer', description: 'Give one good thing your full attention.', icon: Timer, image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=85', accent: '#d6a84f' },
  { id: 'notes', label: 'Notes', eyebrow: 'Tiny notebook', description: 'Catch the thought before it floats away.', icon: NotebookPen, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=85', accent: '#d96c8b' },
  { id: 'weather', label: 'Weather', eyebrow: 'Look outside', description: 'A tiny forecast for the shape of your day.', icon: CloudSun, image: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=700&q=85', accent: '#7fc8e8' },
  { id: 'habits', label: 'Habits', eyebrow: 'Small rituals', description: 'Keep the promises you make to yourself.', icon: CheckCircle2, image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=700&q=85', accent: '#b3d66b' },
  { id: 'stopwatch', label: 'Stopwatch', eyebrow: 'Count the moment', description: 'See how much time a good thing can hold.', icon: Watch, image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=700&q=85', accent: '#c5a4e8' },
  { id: 'breathing', label: 'Breathe', eyebrow: 'Reset gently', description: 'A small rhythm to bring you back to yourself.', icon: Wind, image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85', accent: '#77d6c2' },
  { id: 'mood', label: 'Mood check', eyebrow: 'How are you?', description: 'Name the weather inside before you move on.', icon: HeartPulse, image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=700&q=85', accent: '#ef9bb4' },
  { id: 'music', label: 'Soundtrack', eyebrow: 'Set the tone', description: 'A little sound can change the shape of a room.', icon: Music2, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=85', accent: '#f1bd68' },
  { id: 'world-clock', label: 'World clock', eyebrow: 'Somewhere else', description: 'Keep the people and places you love in view.', icon: Globe2, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=85', accent: '#8bb5f2' },
]

function App() {
  const [activeId, setActiveId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const active = features.find((item) => item.id === activeId)
  const openFeature = (id) => { setActiveId(id); setMenuOpen(false) }
  useEffect(() => {
    if (!menuOpen) return undefined
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target) && !event.target.closest('.menu-toggle')) setMenuOpen(false)
    }
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeMenu); document.removeEventListener('keydown', closeOnEscape) }
  }, [menuOpen])
  return <main className={`app-shell ${active ? '' : 'menu-only'}`}>
    <header className="topbar"><button className="brand" onClick={() => setActiveId(null)} aria-label="Return to Orbit home"><span className="brand-mark"><Sparkles size={17} /></span><span>orbit<span className="brand-dot">.</span></span></button><p className="date-stamp">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</p><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={20} /></button></header>
    {menuOpen && <nav ref={menuRef} className="quick-menu" aria-label="Feature navigation">{features.map((item) => <button key={item.id} onClick={() => openFeature(item.id)}><span>{item.label}</span><ArrowUpRight size={15} /></button>)}</nav>}
    {active ? <FeatureView active={active} onBack={() => setActiveId(null)} /> : <HomeView onOpen={openFeature} />}
    {active && <footer><span>YOUR SMALL SPACE TO THINK</span><span className="footer-line" /><span>01 / 12</span></footer>}
  </main>
}

function HomeView({ onOpen }) {
  return <section className="home-view"><InfiniteMenu items={features} scale={1} backgroundColor="#03050b" onItemClick={(item) => onOpen(item.id)} /></section>
}

function FeatureView({ active, onBack }) {
  const Icon = active.icon
  return <section className="feature-view" style={{ '--accent': active.accent }}><button className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to orbit</button><div className="feature-heading"><div className="feature-icon"><Icon size={22} /></div><div><p className="kicker">{active.eyebrow}</p><h1>{active.label}</h1></div></div><div className="feature-layout"><div className="feature-visual"><img src={active.image} alt="" /><div><span>0{features.findIndex((item) => item.id === active.id) + 1}</span><p>{active.description}</p></div></div><div className="tool-panel"><Tool id={active.id} /></div></div></section>
}

function Tool({ id }) { if (id === 'calculator') return <Calculator />; if (id === 'bmi') return <Bmi />; if (id === 'focus') return <FocusTimer />; if (id === 'notes') return <Notes />; if (id === 'weather') return <Weather />; if (id === 'habits') return <Habits />; if (id === 'stopwatch') return <Stopwatch />; if (id === 'breathing') return <Breathing />; if (id === 'mood') return <Mood />; if (id === 'music') return <MusicTool />; if (id === 'world-clock') return <WorldClock />; return <CalendarTool /> }

function CalendarTool() {
  const [month, setMonth] = useState(new Date()); const [selected, setSelected] = useState(new Date().getDate())
  const days = useMemo(() => { const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay(); const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] }, [month])
  return <div><div className="tool-title"><div><span className="tool-label">TODAY'S VIEW</span><h2>{month.toLocaleString('en', { month: 'long', year: 'numeric' })}</h2></div><div className="tool-actions"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}><ArrowLeft size={16} /></button><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}><ArrowUpRight size={16} /></button></div></div><div className="calendar-grid">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span className="weekday" key={`${day}-${i}`}>{day}</span>)}{days.map((day, i) => <button className={day === selected ? 'selected-day' : ''} key={i} onClick={() => day && setSelected(day)}>{day}</button>)}</div><div className="calendar-note"><Clock3 size={16} /><span>{selected} {month.toLocaleString('en', { month: 'long' })}</span><strong>Make room for what matters.</strong></div></div>
}

function Calculator() {
  const [display, setDisplay] = useState('0'); const press = (value) => { if (value === 'C') return setDisplay('0'); if (value === '=') { try { setDisplay(String(Function(`return ${display}`)())) } catch { setDisplay('Error') }; return } setDisplay(display === '0' || display === 'Error' ? value : display + value) }
  return <div><span className="tool-label">QUICK CALCULATIONS</span><div className="calc-display">{display}</div><div className="calc-keys">{['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((key) => <button className={['/', '*', '-', '+', '='].includes(key) ? 'operator' : ''} key={key} onClick={() => press(key)}>{key}</button>)}</div></div>
}

function Bmi() {
  const [height, setHeight] = useState('170'); const [weight, setWeight] = useState('65'); const result = Number(height) && Number(weight) ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1) : '--'; const label = result < 18.5 ? 'A little light' : result < 25 ? 'In the balanced range' : 'Worth checking in'
  return <div><span className="tool-label">A GENTLE SNAPSHOT</span><div className="input-row"><label>Height <span>cm</span><input value={height} onChange={(e) => setHeight(e.target.value)} /></label><label>Weight <span>kg</span><input value={weight} onChange={(e) => setWeight(e.target.value)} /></label></div><div className="bmi-result"><strong>{result}</strong><span>BMI</span><p>{label}</p></div><div className="bmi-scale"><span>under</span><i /><span>balanced</span><i /><span>over</span></div><p className="fine-print">BMI is a general guide, not a diagnosis. Your context matters more than a number.</p></div>
}

function FocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60); const [running, setRunning] = useState(false)
  useEffect(() => { if (!running) return undefined; const timer = setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 0), 1000); return () => clearInterval(timer) }, [running])
  return <div><span className="tool-label">ONE THING AT A TIME</span><div className="timer-face"><span>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span><small>deep work</small></div><div className="timer-actions"><button className="primary-action" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start focus'} <ArrowUpRight size={16} /></button><button className="icon-action" onClick={() => { setRunning(false); setSeconds(25 * 60) }}><RotateCcw size={17} /></button></div></div>
}

function Notes() {
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('orbit-notes') || '["The best ideas usually arrive between things.","Call Mum on Sunday"]')); const [draft, setDraft] = useState(''); useEffect(() => localStorage.setItem('orbit-notes', JSON.stringify(notes)), [notes]); const addNote = () => { if (!draft.trim()) return; setNotes([draft.trim(), ...notes]); setDraft('') }
  return <div><span className="tool-label">CLEAR YOUR HEAD</span><div className="note-entry"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Write a thought..." /><button onClick={addNote}><Plus size={18} /></button></div><div className="note-list">{notes.map((note, i) => <div className="note-row" key={`${note}-${i}`}><span>{note}</span><button onClick={() => setNotes(notes.filter((_, index) => index !== i))} aria-label="Delete note"><Trash2 size={15} /></button></div>)}</div></div>
}

function Weather() { return <div><span className="tool-label">TODAY IN YOUR POCKET</span><div className="weather-reading"><CloudSun size={45} /><div><strong>18°</strong><span>partly cloudy</span></div></div><div className="weather-meta"><span>Feels like <b>17°</b></span><span>Wind <b>12 km/h</b></span><span>Humidity <b>64%</b></span></div><p className="fine-print">A soft day for a walk, a window seat, or staying exactly where you are.</p></div> }

function Habits() { const [done, setDone] = useState(() => JSON.parse(localStorage.getItem('orbit-habits') || '[true,false,true]')); const labels = ['Drink a glass of water', 'Move for ten minutes', 'Write one honest line']; useEffect(() => localStorage.setItem('orbit-habits', JSON.stringify(done)), [done]); return <div><span className="tool-label">TODAY'S RITUALS</span><div className="habit-list">{labels.map((label, index) => <button className={`habit-row ${done[index] ? 'done' : ''}`} key={label} onClick={() => setDone(done.map((value, itemIndex) => itemIndex === index ? !value : value))}><span>{done[index] ? <CheckCircle2 size={19} /> : <span className="empty-check" />}</span>{label}<small>{done[index] ? 'done' : 'open'}</small></button>)}</div><p className="habit-count">{done.filter(Boolean).length} of {labels.length} complete</p></div> }

function Stopwatch() { const [seconds, setSeconds] = useState(0); const [running, setRunning] = useState(false); useEffect(() => { if (!running) return undefined; const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer) }, [running]); return <div><span className="tool-label">MAKE TIME VISIBLE</span><div className="stopwatch-face">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</div><div className="timer-actions"><button className="primary-action" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'} <ArrowUpRight size={16} /></button><button className="icon-action" onClick={() => { setRunning(false); setSeconds(0) }}><RotateCcw size={17} /></button></div></div> }

function Breathing() { const [phase, setPhase] = useState('inhale'); useEffect(() => { const timer = setInterval(() => setPhase((value) => value === 'inhale' ? 'exhale' : 'inhale'), 4000); return () => clearInterval(timer) }, []); return <div><span className="tool-label">FOUR COUNT RHYTHM</span><div className={`breath-orb ${phase}`}><Wind size={25} /><strong>{phase}</strong><small>for four</small></div><p className="fine-print">Follow the circle. Let your shoulders drop on the exhale.</p></div> }

function Mood() { const [mood, setMood] = useState('steady'); const moods = ['low', 'tender', 'steady', 'bright', 'electric']; return <div><span className="tool-label">A QUICK CHECK-IN</span><h2 className="mood-heading">How does today feel?</h2><div className="mood-list">{moods.map((value) => <button className={mood === value ? 'mood-selected' : ''} key={value} onClick={() => setMood(value)}>{value}</button>)}</div><p className="mood-response">You feel <strong>{mood}</strong>. That is enough information for now.</p></div> }

function MusicTool() { const [playing, setPlaying] = useState(false); return <div><span className="tool-label">A SMALL SOUNDTRACK</span><div className="music-card"><Music2 size={28} /><div><strong>{playing ? 'Soft focus' : 'Quiet morning'}</strong><span>{playing ? 'Now playing' : 'Ready when you are'}</span></div><button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button></div><div className="music-wave">{[20, 38, 26, 52, 33, 44, 18, 36, 48, 25].map((height, index) => <i style={{ height }} key={index} />)}</div></div> }

function WorldClock() { const zones = [{ city: 'London', zone: 'Europe/London' }, { city: 'New York', zone: 'America/New_York' }, { city: 'Tokyo', zone: 'Asia/Tokyo' }]; const now = new Date(); return <div><span className="tool-label">RIGHT NOW, SOMEWHERE</span><div className="clock-list">{zones.map(({ city, zone }) => <div className="clock-row" key={city}><span>{city}</span><strong>{new Intl.DateTimeFormat('en', { timeZone: zone, hour: '2-digit', minute: '2-digit' }).format(now)}</strong></div>)}</div><p className="fine-print">Every place has its own now. Keep yours close.</p></div> }

export default App

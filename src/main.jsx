import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowDownRight, ArrowRight, Bell, CalendarDays, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, Command, Compass, Cpu, Flame, LayoutDashboard,
  ListTodo, MessageCircle, MoreHorizontal, Plus, RefreshCw, Send, Settings2,
  Sparkles, Target, Trash2, TrendingUp, X, Zap
} from 'lucide-react'
import './styles.css'

const starterTasks = [
  { id: 1, title: 'Review algebra — quadratic equations', category: 'Study', time: '09:00', duration: 50, priority: 'High', done: true },
  { id: 2, title: 'Read chapter 4 and make notes', category: 'Study', time: '10:15', duration: 40, priority: 'Medium', done: false },
  { id: 3, title: 'Complete science assignment', category: 'Assignment', time: '12:00', duration: 60, priority: 'High', done: false },
  { id: 4, title: 'Take a proper break', category: 'Break', time: '13:00', duration: 20, priority: 'Low', done: false },
  { id: 5, title: 'Practice English vocabulary', category: 'Practice', time: '15:30', duration: 30, priority: 'Medium', done: false },
]

const initialChat = [
  { role: 'orbit', text: "Hey there! I've looked over your plan. You're off to a good start — one task down already. Want to focus on your next study block?" }
]

function loadTasks() {
  try { const saved = localStorage.getItem('orbit.tasks'); return saved ? JSON.parse(saved) : starterTasks }
  catch { return starterTasks }
}

function Robot({ small = false }) {
  return <div className={`robot ${small ? 'robot-small' : ''}`} aria-label="ORBIT robot avatar">
    <div className="robot-aura" />
    <div className="robot-ear ear-left" /><div className="robot-ear ear-right" />
    <div className="robot-head">
      <div className="robot-glass"><span className="robot-eye"/><span className="robot-eye"/></div>
      <div className="robot-smile" />
      <div className="robot-temple" />
    </div>
    <div className="robot-neck" />
    <div className="robot-body"><div className="robot-core"><span /></div><div className="robot-chest-line" /></div>
    <div className="robot-arm arm-left"/><div className="robot-arm arm-right"/>
  </div>
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', category: 'Study', time: '16:00', duration: 45, priority: 'Medium' })
  const [chat, setChat] = useState(initialChat)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => { localStorage.setItem('orbit.tasks', JSON.stringify(tasks)) }, [tasks])

  const completed = tasks.filter(t => t.done).length
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0
  const remainingMinutes = tasks.filter(t => !t.done).reduce((sum, t) => sum + Number(t.duration || 0), 0)
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const orderedTasks = useMemo(() => [...tasks].sort((a, b) => a.time.localeCompare(b.time)), [tasks])
  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = id => setTasks(prev => prev.filter(t => t.id !== id))
  const addTask = e => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setTasks(prev => [...prev, { ...newTask, id: Date.now(), done: false }])
    setNewTask({ title: '', category: 'Study', time: '16:00', duration: 45, priority: 'Medium' })
    setShowAdd(false)
    setNotice('Task added to your plan.')
    setTimeout(() => setNotice(''), 2600)
  }

  const recoverSchedule = () => {
    const pending = [...tasks].filter(t => !t.done).sort((a, b) => (a.priority === 'High' ? -1 : 1) - (b.priority === 'High' ? -1 : 1))
    if (!pending.length) { setNotice('Everything is complete. Enjoy your free time!'); return }
    let cursor = 16 * 60
    const updates = new Map()
    pending.forEach(t => {
      const hh = String(Math.floor(cursor / 60) % 24).padStart(2, '0')
      const mm = String(cursor % 60).padStart(2, '0')
      updates.set(t.id, `${hh}:${mm}`)
      cursor += Number(t.duration || 30) + 10
    })
    setTasks(prev => prev.map(t => updates.has(t.id) ? { ...t, time: updates.get(t.id) } : t))
    setNotice(`Plan refreshed. ${pending.length} remaining tasks rearranged from 4:00 PM, with priority tasks first.`)
    setTimeout(() => setNotice(''), 5000)
  }

  const sendMessage = e => {
    e.preventDefault()
    const value = message.trim()
    if (!value) return
    setChat(prev => [...prev, { role: 'user', text: value }])
    setMessage('')
    const lower = value.toLowerCase()
    let reply = `I hear you. Based on your plan, you have ${tasks.filter(t => !t.done).length} tasks left and about ${remainingMinutes} minutes of work. Let's take it one step at a time.`
    if (lower.includes('next') || lower.includes('what should')) {
      const next = orderedTasks.find(t => !t.done)
      reply = next ? `I'd start with “${next.title}”. It's scheduled for ${next.time} and needs about ${next.duration} minutes. Give it your full attention, then take a short reset.` : 'Your plan is clear — everything is complete. Take a well-earned break!'
    } else if (lower.includes('behind') || lower.includes('missed') || lower.includes('reschedule')) {
      reply = 'No stress. I can help you recover your day. Use the “Rebalance my day” action and I’ll reorder unfinished tasks by priority. We can adjust the start time after that.'
    } else if (lower.includes('progress') || lower.includes('done')) {
      reply = `You're ${progress}% through today's plan. ${completed} of ${tasks.length} tasks are complete. Every small step counts.`
    }
    window.setTimeout(() => setChat(prev => [...prev, { role: 'orbit', text: reply }]), 450)
  }

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard }, { name: 'My schedule', icon: CalendarDays },
    { name: 'Tasks', icon: ListTodo }, { name: 'Progress', icon: Activity }
  ]

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span className="brand-orbit"/></div><div><strong>ORBIT</strong><small>PERSONAL AI</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.name} className={`nav-item ${activeTab === item.name ? 'active' : ''}`} onClick={() => setActiveTab(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name === 'Tasks' && <span className="nav-count">{tasks.filter(t => !t.done).length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16}/></div><strong>Small steps, big orbit.</strong><p>Consistency beats intensity. Keep your momentum going.</p><div className="tip-progress"><span style={{ width: `${progress}%` }}/></div><small>{progress}% of today's plan</small></div>
        <button className="nav-item" onClick={() => setNotice('Settings are coming soon.')}><Settings2 size={18}/><span>Settings</span></button>
        <div className="profile"><div className="profile-avatar">A</div><div><strong>Your workspace</strong><small>Personal account</small></div><MoreHorizontal size={18} className="muted-icon"/></div>
      </div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{activeTab}</strong></div><div className="top-actions"><div className="status-pill"><span className="status-dot"/> ORBIT is online</div><button className="icon-button notification-button" onClick={() => setShowNotifications(v => !v)} aria-label="Notifications"><Bell size={18}/><i/></button>{showNotifications && <div className="notification-pop"><strong>You're all caught up</strong><p>ORBIT will let you know when your plan needs attention.</p></div>}<div className="top-avatar">A</div></div></header>

      <div className="page-wrap">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL COMMAND CENTER</div><h1>{greeting}, <span>Adventurer.</span></h1><p className="date-line">{dateLabel} <span>·</span> Let's make today count.</p></div><button className="date-button"><CalendarDays size={16}/>{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<ChevronDown size={14}/></button></section>

        <section className="hero-card">
          <div className="hero-copy"><div className="hero-kicker"><span className="pulse-dot"/> YOUR AI COMPANION</div><h2>Your day, <em>in sync.</em></h2><p>I've been looking at your goals. You're making progress — let's keep your momentum moving in the right direction.</p><div className="hero-actions"><button className="primary-button" onClick={() => setActiveTab('My schedule')}>View my schedule <ArrowRight size={16}/></button><button className="text-button" onClick={recoverSchedule}><RefreshCw size={15}/> Rebalance my day</button></div><div className="hero-footnote"><Sparkles size={13}/> ORBIT INSIGHT <span>·</span> Protect your focus time. It adds up.</div></div>
          <div className="hero-visual"><div className="visual-grid"/><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="orbit-node node-one"/><div className="orbit-node node-two"/><Robot/><div className="floating-chip chip-top"><span className="chip-check"><Check size={11}/></span> Focus mode ready</div><div className="floating-chip chip-bottom"><Activity size={14}/> <span>Systems nominal</span><i/></div></div>
        </section>

        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>DAILY PROGRESS</span><div className="stat-icon blue"><Target size={17}/></div></div><div className="stat-value">{progress}<small>%</small></div><div className="stat-bottom"><div className="mini-track"><span style={{width:`${progress}%`}}/></div><span>{completed}/{tasks.length} tasks</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>FOCUS TIME LEFT</span><div className="stat-icon violet"><Clock3 size={17}/></div></div><div className="stat-value">{Math.floor(remainingMinutes / 60)}<small>h</small> {remainingMinutes % 60}<small>m</small></div><div className="stat-caption">Estimated work remaining</div></div>
          <div className="stat-card"><div className="stat-top"><span>COMPLETED TODAY</span><div className="stat-icon green"><CheckCircle2 size={17}/></div></div><div className="stat-value">{completed}<small> tasks</small></div><div className="stat-caption positive"><TrendingUp size={13}/> Keep the momentum</div></div>
          <div className="stat-card"><div className="stat-top"><span>FOCUS STREAK</span><div className="stat-icon orange"><Flame size={17}/></div></div><div className="stat-value">3<small> days</small></div><div className="stat-caption">A little consistency goes far</div></div>
        </section>

        <div className="content-grid">
          <section className="panel schedule-panel"><div className="panel-heading"><div><div className="eyebrow">STAY ON TRACK</div><h3>{activeTab === 'Tasks' ? 'Your task list' : activeTab === 'Progress' ? 'Your progress' : activeTab === 'My schedule' ? 'Today's schedule' : 'Today's schedule'} <span className="heading-count">{tasks.length}</span></h3></div><button className="subtle-button" onClick={() => setShowAdd(true)}><Plus size={15}/> Add task</button></div>
            {activeTab === 'Progress' ? <div className="progress-view"><div className="progress-ring" style={{'--progress': `${progress}%`}}><div><strong>{progress}%</strong><small>complete</small></div></div><div><h4>You're building momentum.</h4><p>{completed} completed · {tasks.length - completed} still to go. Your progress is saved on this device.</p></div></div> : <div className="task-list">{orderedTasks.length ? orderedTasks.map((task, i) => <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? 'Mark incomplete' : 'Complete task'}>{task.done && <Check size={13}/>}</button><div className="task-time">{task.time}</div><div className="task-info"><strong>{task.title}</strong><div><span className={`category-dot ${task.category.toLowerCase()}`}/>{task.category}<span className="task-divider">·</span>{task.duration} min</div></div><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><button className="delete-task" onClick={() => deleteTask(task.id)} aria-label="Delete task"><Trash2 size={15}/></button></div>) : <div className="empty-state"><ListTodo size={24}/><strong>Your schedule is clear</strong><span>Add a task to give your day direction.</span></div>}</div>}
            <button className="view-all-button" onClick={() => setActiveTab(activeTab === 'Tasks' ? 'My schedule' : 'Tasks')}>{activeTab === 'Tasks' ? 'Back to schedule' : 'View all tasks'} <ArrowRight size={15}/></button>
          </section>

          <section className="panel companion-panel"><div className="panel-heading companion-heading"><div><div className="eyebrow">ALWAYS IN YOUR CORNER</div><h3>Talk to ORBIT</h3></div><span className="online-label"><i/> ONLINE</span></div><div className="companion-intro"><div className="mini-robot-wrap"><Robot small/></div><div><strong>Hey, I'm ORBIT.</strong><p>Your goals are my mission. What's on your mind?</p></div></div><div className="chat-messages">{chat.map((item, i) => <div className={`chat-line ${item.role}`} key={i}>{item.role === 'orbit' && <div className="chat-avatar"><Sparkles size={13}/></div>}<div className="chat-bubble">{item.text}</div></div>)}</div><div className="suggestions"><button onClick={() => setMessage('What should I focus on next?')}>What's next?</button><button onClick={() => setMessage('How is my progress today?')}>My progress</button></div><form className="chat-input" onSubmit={sendMessage}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask ORBIT anything..." aria-label="Message ORBIT"/><button type="submit" aria-label="Send message"><Send size={16}/></button></form><div className="chat-disclaimer">ORBIT demo · Connect an AI provider to enable live AI.</div></section>
        </div>
        <footer className="footer"><span>ORBIT <b>·</b> YOUR DAY, IN SYNC.</span><span><span className="footer-dot"/> All systems operational</span></footer>
      </div>
    </main>

    {showAdd && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowAdd(false)}><form className="task-modal" onSubmit={addTask}><div className="modal-heading"><div><div className="eyebrow">MAKE IT HAPPEN</div><h3>Add a task</h3></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)}><X size={18}/></button></div><label>Task name<input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title:e.target.value})} placeholder="What do you want to get done?" required/></label><div className="form-row"><label>Category<select value={newTask.category} onChange={e => setNewTask({...newTask, category:e.target.value})}><option>Study</option><option>Assignment</option><option>Practice</option><option>Break</option><option>Personal</option></select></label><label>Start time<input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time:e.target.value})}/></label></div><div className="form-row"><label>Duration (minutes)<input type="number" min="5" max="480" value={newTask.duration} onChange={e => setNewTask({...newTask, duration:e.target.value})}/></label><label>Priority<select value={newTask.priority} onChange={e => setNewTask({...newTask, priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div><button className="primary-button modal-submit" type="submit">Add to my schedule <ArrowRight size={16}/></button></form></div>}
    {notice && <div className="toast"><CheckCircle2 size={16}/>{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)

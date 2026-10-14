import { useEffect, useState } from 'react'
import {
  ArrowDownUp, ArrowRight, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronDown, Clock3,
  CircleUserRound, LogOut, Mail, MoreHorizontal, Pencil, Plus, Search,
  ShieldCheck, Trash2, Users, X,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || body.error || `Request failed (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

function initials(employee) {
  return `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatClock(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not recorded'
}

function attendanceDuration(record) {
  if (!record.checkOut) return 'In progress'
  const totalMinutes = Math.max(0, Math.floor((new Date(record.checkOut) - new Date(record.checkIn)) / 60000))
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}m`
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('ems-token'))
  const [username, setUsername] = useState(() => localStorage.getItem('ems-user') || 'admin')
  const [role, setRole] = useState(() => localStorage.getItem('ems-role') || 'ADMIN')
  const [view, setView] = useState('people')
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(null)

  async function refresh() {
    if (!token) return
    setLoading(true)
    try {
      if (role === 'EMPLOYEE') {
        const [profile, records] = await Promise.all([
          request('/me', token), request('/me/attendance', token),
        ])
        setMyProfile(profile)
        setAttendance(records)
        setError('')
        return
      }
      const [people, teams] = await Promise.all([
        request('/employees', token), request('/departments', token),
      ])
      setEmployees(people)
      setDepartments(teams)
      setError('')
    } catch (caught) {
      setError(caught.message)
      if (caught.message.includes('(401)') || caught.message.includes('(403)')) signOut()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [token])

  function signOut() {
    localStorage.removeItem('ems-token')
    localStorage.removeItem('ems-user')
    localStorage.removeItem('ems-role')
    setToken(null)
    setEmployees([])
    setDepartments([])
    setMyProfile(null)
    setAttendance([])
  }

  async function login(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    try {
      const result = await request('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      })
      localStorage.setItem('ems-token', result.token)
      localStorage.setItem('ems-user', result.username)
      localStorage.setItem('ems-role', result.role)
      setUsername(result.username)
      setRole(result.role)
      setToken(result.token)
    } catch (caught) {
      setError(caught.message === 'Request failed (401)' ? 'That username and password did not match.' : caught.message)
    }
  }

  async function saveEmployee(employee) {
    const editing = Boolean(employee.id)
    await request(editing ? `/employees/${employee.id}` : '/employees', token, {
      method: editing ? 'PUT' : 'POST', body: JSON.stringify(employee),
    })
    setModal(null)
    await refresh()
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Remove ${employee.firstName} ${employee.lastName} from the directory?`)) return
    try {
      await request(`/employees/${employee.id}`, token, { method: 'DELETE' })
      await refresh()
    } catch (caught) { setError(caught.message) }
  }

  async function saveDepartment(department) {
    const editing = Boolean(department.id)
    await request(editing ? `/departments/${department.id}` : '/departments', token, {
      method: editing ? 'PUT' : 'POST', body: JSON.stringify(department),
    })
    setModal(null)
    await refresh()
  }

  async function deleteDepartment(department) {
    if (!window.confirm(`Delete ${department.name}? Departments with employees cannot be removed.`)) return
    try {
      await request(`/departments/${department.id}`, token, { method: 'DELETE' })
      await refresh()
    } catch (caught) { setError(caught.message) }
  }

  async function clock(action) {
    try {
      await request(`/me/attendance/${action}`, token, { method: 'POST' })
      await refresh()
    } catch (caught) {
      setError(caught.message)
    }
  }

  const visibleEmployees = employees.filter((employee) => {
    const matchesQuery = `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.position}`
      .toLowerCase().includes(query.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || String(employee.departmentId) === departmentFilter
    const matchesStatus = statusFilter === 'all' || employee.employmentStatus === statusFilter
    return matchesQuery && matchesDepartment && matchesStatus
  })
  const activeCount = employees.filter((employee) => employee.employmentStatus === 'Active').length

  if (!token) return <Login onSubmit={login} error={error} />
  if (role === 'EMPLOYEE') {
    return <EmployeePortal username={username} profile={myProfile} attendance={attendance} loading={loading} error={error} signOut={signOut} onClock={clock} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#people" onClick={() => setView('people')}>
          <span className="brand-mark"><Users size={18} strokeWidth={2.4} /></span>
          <span>northstar<span className="brand-dot">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={view === 'people' ? 'nav-item active' : 'nav-item'} onClick={() => setView('people')}>
            <Users size={17} /> <span>People</span><span className="nav-count">{employees.length}</span>
          </button>
          <button className={view === 'departments' ? 'nav-item active' : 'nav-item'} onClick={() => setView('departments')}>
            <Building2 size={17} /> <span>Departments</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><ShieldCheck size={16} /><span>Workspace secured</span><Check size={13} /></div>
          <button className="profile" onClick={signOut} title="Sign out">
            <span className="profile-avatar">{username.slice(0, 1).toUpperCase()}</span>
            <span className="profile-info"><strong>{username}</strong><small>Administrator</small></span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ArrowRight size={13} /><strong>{view === 'people' ? 'People' : 'Departments'}</strong></div>
          <button className="user-chip" onClick={signOut} title="Sign out"><span className="online-dot" />{username}<ChevronDown size={14} /></button>
        </header>

        <div className="page-content">
          {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}
          {view === 'people' ? (
            <>
              <section className="page-heading">
                <div><div className="eyebrow">PEOPLE OPERATIONS <span className="eyebrow-line" /></div><h1>People directory</h1><p>Your team, all in one place.</p></div>
                <button className="primary-button" onClick={() => setModal({ type: 'employee' })}><Plus size={17} /> Add employee</button>
              </section>
              <section className="stats-row" aria-label="Team overview">
                <div className="stat-block"><span className="stat-icon mint"><Users size={17} /></span><div><small>Total people</small><strong>{employees.length}</strong></div><span className="stat-note">in your workspace</span></div>
                <div className="stat-block"><span className="stat-icon blue"><BriefcaseBusiness size={17} /></span><div><small>Active</small><strong>{activeCount}</strong></div><span className="stat-note">currently working</span></div>
                <div className="stat-block"><span className="stat-icon coral"><Building2 size={17} /></span><div><small>Departments</small><strong>{departments.length}</strong></div><span className="stat-note">teams across org</span></div>
              </section>
              <section className="directory-section">
                <div className="section-header"><div><h2>All employees <span className="subtle-count">{visibleEmployees.length}</span></h2><p>Manage your team members and their details.</p></div></div>
                <div className="table-toolbar">
                  <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people..." /></label>
                  <div className="toolbar-filters">
                    <label className="select-wrap"><Building2 size={15} /><select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option value="all">All departments</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><ChevronDown size={14} /></label>
                    <label className="select-wrap"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Any status</option><option>Active</option><option>On leave</option><option>Inactive</option></select><ChevronDown size={14} /></label>
                  </div>
                </div>
                <div className="table-scroll"><table>
                  <thead><tr><th><span>EMPLOYEE <ArrowDownUp size={12} /></span></th><th>ROLE</th><th>DEPARTMENT</th><th>STATUS</th><th>JOINED</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {loading && employees.length === 0 ? <tr><td colSpan="6" className="empty-row">Loading your directory...</td></tr> : visibleEmployees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td><div className="employee-cell"><span className={`avatar avatar-${index % 5}`}>{initials(employee)}</span><span className="employee-name"><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></span></div></td>
                        <td>{employee.position || '—'}</td>
                        <td><span className="department-label"><i />{employee.departmentName || 'Unassigned'}</span></td>
                        <td><span className={`status status-${(employee.employmentStatus || 'active').toLowerCase().replaceAll(' ', '-')}`}><i />{employee.employmentStatus || 'Active'}</span></td>
                        <td>{employee.hireDate ? new Date(`${employee.hireDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                        <td><div className="row-actions"><button title="Edit employee" onClick={() => setModal({ type: 'employee', data: employee })}><Pencil size={15} /></button><button title="Remove employee" onClick={() => deleteEmployee(employee)}><Trash2 size={15} /></button></div></td>
                      </tr>
                    ))}
                    {!loading && visibleEmployees.length === 0 && <tr><td colSpan="6" className="empty-row"><CircleUserRound size={22} /><strong>No people found</strong><span>Try a different search or add a team member.</span></td></tr>}
                  </tbody>
                </table></div>
                <div className="table-footer"><span>Showing <strong>{visibleEmployees.length}</strong> of <strong>{employees.length}</strong> people</span><span>Directory sync <i className="sync-dot" /> up to date</span></div>
              </section>
            </>
          ) : (
            <section className="department-page">
              <section className="page-heading">
                <div><div className="eyebrow">PEOPLE OPERATIONS <span className="eyebrow-line" /></div><h1>Departments</h1><p>Keep teams and reporting groups organized.</p></div>
                <button className="primary-button" onClick={() => setModal({ type: 'department' })}><Plus size={17} /> Add department</button>
              </section>
              <div className="department-summary"><span className="stat-icon coral"><Building2 size={17} /></span><div><strong>{departments.length} teams</strong><span>with {employees.length} people across your organization</span></div></div>
              <div className="department-list">
                {departments.map((department, index) => {
                  const members = employees.filter((employee) => employee.departmentId === department.id)
                  return <article className="department-row" key={department.id}>
                    <span className={`department-icon department-icon-${index % 4}`}><Building2 size={19} /></span>
                    <div className="department-details"><strong>{department.name}</strong><span>{department.description || 'No description'}</span></div>
                    <div className="department-members"><span className="member-stack">{members.slice(0, 3).map((person, i) => <i className={`avatar avatar-${i % 5}`} key={person.id}>{initials(person)}</i>)}</span><span>{members.length} {members.length === 1 ? 'person' : 'people'}</span></div>
                    <div className="row-actions"><button title="Edit department" onClick={() => setModal({ type: 'department', data: department })}><Pencil size={15} /></button><button title="Delete department" onClick={() => deleteDepartment(department)}><Trash2 size={15} /></button></div>
                  </article>
                })}
                {departments.length === 0 && <div className="empty-departments"><Building2 size={24} /><strong>No departments yet</strong><button className="text-button" onClick={() => setModal({ type: 'department' })}>Create your first department</button></div>}
              </div>
            </section>
          )}
        </div>
      </main>
      {modal && <Modal modal={modal} departments={departments} onClose={() => setModal(null)} onSave={modal.type === 'employee' ? saveEmployee : saveDepartment} />}
    </div>
  )
}

function Login({ onSubmit, error }) {
  return <main className="login-page">
    <div className="login-art"><div className="login-art-grid" /><a className="brand login-brand" href="#"><span className="brand-mark"><Users size={18} strokeWidth={2.4} /></span><span>northstar<span className="brand-dot">.</span></span></a><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-copy"><span className="art-kicker">PEOPLE, IN GOOD COMPANY</span><h1>Build a workplace<br />that works for<br /><em>everyone.</em></h1><p>One thoughtful space for the people who move your business forward.</p><div className="art-avatars"><span>AM</span><span>JL</span><span>SK</span><span>+</span><small>Your team is here</small></div></div><span className="art-foot">EMPLOYEE MANAGEMENT · 2026</span></div>
    <div className="login-side"><div className="login-card"><div className="login-mobile-brand"><span className="brand-mark"><Users size={18} /></span> northstar<span className="brand-dot">.</span></div><div className="login-icon"><ShieldCheck size={21} /></div><span className="eyebrow">PEOPLE WORKSPACE</span><h2>Welcome back</h2><p>Sign in to continue to your workspace.</p><form onSubmit={onSubmit}>
      <label className="form-field"><span>Username</span><div><CircleUserRound size={17} /><input name="username" autoComplete="username" placeholder="Your username" required /></div></label>
      <label className="form-field"><span>Password</span><div><ShieldCheck size={17} /><input type="password" name="password" autoComplete="current-password" placeholder="Your password" required /></div></label>
      {error && <div className="login-error" role="alert">{error}</div>}
      <button className="primary-button login-submit" type="submit">Sign in <ArrowRight size={16} /></button>
    </form><div className="login-security"><ShieldCheck size={15} /><span>Secure, encrypted access</span></div></div><span className="login-copyright">NORTHSTAR PEOPLE SYSTEMS</span></div>
  </main>
}

function EmployeePortal({ username, profile, attendance, loading, error, signOut, onClock }) {
  const [activeView, setActiveView] = useState('overview')
  const [clocking, setClocking] = useState(false)
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : username
  const todayAttendance = attendance.find((record) => record.workDate === localDateKey())
  const dateJoined = profile?.hireDate
    ? new Date(`${profile.hireDate}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not provided'

  async function handleClock(action) {
    setClocking(true)
    try { await onClock(action) } finally { setClocking(false) }
  }

  return <div className="employee-shell">
    <header className="employee-topbar">
      <a className="brand employee-brand" href="#profile"><span className="brand-mark"><Users size={18} strokeWidth={2.4} /></span><span>northstar<span className="brand-dot">.</span></span></a>
      <div className="employee-account"><span className="online-dot" />Employee workspace <button onClick={signOut} title="Sign out"><LogOut size={16} /><span>Sign out</span></button></div>
    </header>
    <main className="employee-content">
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="employee-welcome"><div><span className="eyebrow">YOUR WORKSPACE <span className="eyebrow-line" /></span><h1>Welcome, {profile?.firstName || username}.</h1><p>Your work, your details, all in one place.</p></div><span className="employee-welcome-mark"><CircleUserRound size={25} /></span></div>
      <nav className="employee-tabs" aria-label="Employee panel">
        <button className={activeView === 'overview' ? 'employee-tab active' : 'employee-tab'} aria-current={activeView === 'overview' ? 'page' : undefined} onClick={() => setActiveView('overview')}><BriefcaseBusiness size={15} />Overview</button>
        <button className={activeView === 'profile' ? 'employee-tab active' : 'employee-tab'} aria-current={activeView === 'profile' ? 'page' : undefined} onClick={() => setActiveView('profile')}><CircleUserRound size={15} />My profile</button>
        <button className={activeView === 'attendance' ? 'employee-tab active' : 'employee-tab'} aria-current={activeView === 'attendance' ? 'page' : undefined} onClick={() => setActiveView('attendance')}><Clock3 size={15} />Attendance</button>
      </nav>
      {loading && !profile ? <div className="employee-loading">Loading your profile...</div> : profile && <>
        {activeView === 'attendance' ? <>
          <section className="attendance-today">
            <div className="attendance-today-head"><div><span className="eyebrow">DAILY TIME</span><h2>Today</h2><p><CalendarDays size={14} />{new Date(`${localDateKey()}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div><span className={todayAttendance?.checkOut ? 'attendance-state complete' : todayAttendance ? 'attendance-state working' : 'attendance-state'}><i />{todayAttendance?.checkOut ? 'Complete' : todayAttendance ? 'In progress' : 'Not started'}</span></div>
            <div className="attendance-clock-row">
              <div className="attendance-times"><div><small>CHECK IN</small><strong>{formatClock(todayAttendance?.checkIn)}</strong></div><span className="attendance-divider" /><div><small>CHECK OUT</small><strong>{formatClock(todayAttendance?.checkOut)}</strong></div></div>
              <button className="primary-button attendance-action" disabled={clocking || Boolean(todayAttendance?.checkOut)} onClick={() => handleClock(todayAttendance ? 'check-out' : 'check-in')}>
                <Clock3 size={16} />{clocking ? 'Recording...' : todayAttendance?.checkOut ? 'Day completed' : todayAttendance ? 'Check out' : 'Check in'}
              </button>
            </div>
          </section>
          <section className="attendance-history">
            <div className="attendance-history-head"><div><span className="eyebrow">YOUR RECORDS</span><h2>Recent attendance</h2></div><span>Last 14 days</span></div>
            <div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>DATE</th><th>CHECK IN</th><th>CHECK OUT</th><th>HOURS</th></tr></thead><tbody>
              {attendance.map((record) => <tr key={record.id}><td>{new Date(`${record.workDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{record.workDate === localDateKey() && <span className="today-tag">Today</span>}</td><td>{formatClock(record.checkIn)}</td><td>{formatClock(record.checkOut)}</td><td>{attendanceDuration(record)}</td></tr>)}
              {attendance.length === 0 && <tr><td colSpan="4" className="attendance-empty">No attendance records yet. Check in to start today’s record.</td></tr>}
            </tbody></table></div>
          </section>
          <div className="employee-help"><span className="help-mark"><Users size={16} /></span><p><strong>Attendance correction?</strong><span>Contact your people administrator if a time entry needs to be corrected.</span></p></div>
        </> : activeView === 'overview' ? <>
          <section className="employee-overview" aria-label="Work overview">
            <div className="overview-intro"><span className="employee-large-avatar">{initials(profile)}</span><div><h2>{fullName}</h2><p>{profile.email || 'Employee account'}</p></div><button className="text-button" onClick={() => setActiveView('profile')}>View my profile <ArrowRight size={14} /></button></div>
            <div className="overview-metrics">
              <article className="overview-metric"><span className="stat-icon mint"><ShieldCheck size={17} /></span><div><small>EMPLOYMENT STATUS</small><span className={`status status-${(profile.employmentStatus || 'active').toLowerCase().replaceAll(' ', '-')}`}><i />{profile.employmentStatus || 'Active'}</span></div></article>
              <article className="overview-metric"><span className="stat-icon blue"><BriefcaseBusiness size={17} /></span><div><small>JOB TITLE</small><strong>{profile.position || 'Not provided'}</strong></div></article>
              <article className="overview-metric"><span className="stat-icon coral"><Building2 size={17} /></span><div><small>DEPARTMENT</small><strong>{profile.departmentName || 'Not assigned'}</strong></div></article>
              <article className="overview-metric"><span className="stat-icon mint"><Check size={17} /></span><div><small>START DATE</small><strong>{dateJoined}</strong></div></article>
            </div>
          </section>
          <div className="employee-help"><span className="help-mark"><Users size={16} /></span><p><strong>Need to update something?</strong><span>Contact your people administrator to make changes to your profile.</span></p></div>
        </> : <>
          <section className="employee-identity">
            <div className="employee-identity-main"><span className="employee-large-avatar">{initials(profile)}</span><div><h2>{fullName}</h2><p>{profile.position || 'Team member'}</p></div><span className={`status status-${(profile.employmentStatus || 'active').toLowerCase().replaceAll(' ', '-')}`}><i />{profile.employmentStatus || 'Active'}</span></div>
            <div className="employee-identity-team"><span className="stat-icon mint"><Building2 size={17} /></span><div><small>YOUR DEPARTMENT</small><strong>{profile.departmentName || 'Not assigned'}</strong></div></div>
          </section>
          <section className="profile-details">
            <div className="profile-section-head"><div><span className="eyebrow">EMPLOYMENT</span><h2>Your details</h2></div><span className="profile-private"><ShieldCheck size={14} /> Visible only to you</span></div>
            <div className="profile-detail-grid">
              <div className="profile-detail"><span className="detail-icon"><Mail size={16} /></span><div><small>WORK EMAIL</small><strong>{profile.email || 'Not provided'}</strong></div></div>
              <div className="profile-detail"><span className="detail-icon"><BriefcaseBusiness size={16} /></span><div><small>JOB TITLE</small><strong>{profile.position || 'Not provided'}</strong></div></div>
              <div className="profile-detail"><span className="detail-icon"><Building2 size={16} /></span><div><small>DEPARTMENT</small><strong>{profile.departmentName || 'Not assigned'}</strong></div></div>
              <div className="profile-detail"><span className="detail-icon"><CircleUserRound size={16} /></span><div><small>PHONE</small><strong>{profile.phone || 'Not provided'}</strong></div></div>
              <div className="profile-detail"><span className="detail-icon"><Check size={16} /></span><div><small>START DATE</small><strong>{dateJoined}</strong></div></div>
              <div className="profile-detail"><span className="detail-icon"><ShieldCheck size={16} /></span><div><small>ANNUAL SALARY</small><strong>{profile.salary == null ? 'Not provided' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(profile.salary)}</strong></div></div>
            </div>
          </section>
          <div className="employee-help"><span className="help-mark"><Users size={16} /></span><p><strong>Need to update something?</strong><span>Contact your people administrator to make changes to your profile.</span></p></div>
        </>}
      </>}
    </main>
    <footer className="employee-footer"><span>NORTHSTAR PEOPLE SYSTEMS</span><span><ShieldCheck size={13} /> Secure employee access</span></footer>
  </div>
}

function Modal({ modal, departments, onClose, onSave }) {
  const isEmployee = modal.type === 'employee'
  const data = modal.data || {}
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const result = isEmployee ? {
      ...(data.id ? { id: data.id } : {}),
      firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'),
      position: form.get('position'), phone: form.get('phone'), hireDate: form.get('hireDate') || null,
      salary: form.get('salary') ? Number(form.get('salary')) : null,
      employmentStatus: form.get('employmentStatus'), departmentId: form.get('departmentId') ? Number(form.get('departmentId')) : null,
    } : { ...(data.id ? { id: data.id } : {}), name: form.get('name'), description: form.get('description') }
    setSaving(true)
    try { await onSave(result) } catch (caught) { setError(caught.message) } finally { setSaving(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><span className="eyebrow">{isEmployee ? 'TEAM DIRECTORY' : 'ORGANIZATION'}</span><h2 id="modal-title">{data.id ? 'Edit' : 'Add'} {isEmployee ? 'employee' : 'department'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <form onSubmit={submit}>
        {isEmployee ? <div className="form-grid">
          <label className="form-field"><span>First name</span><input name="firstName" defaultValue={data.firstName || ''} required /></label>
          <label className="form-field"><span>Last name</span><input name="lastName" defaultValue={data.lastName || ''} required /></label>
          <label className="form-field full"><span>Work email</span><input type="email" name="email" defaultValue={data.email || ''} required /></label>
          <label className="form-field"><span>Job title</span><input name="position" defaultValue={data.position || ''} /></label>
          <label className="form-field"><span>Phone</span><input name="phone" defaultValue={data.phone || ''} /></label>
          <label className="form-field"><span>Department</span><select name="departmentId" defaultValue={data.departmentId || ''}><option value="">Unassigned</option>{departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}</select></label>
          <label className="form-field"><span>Status</span><select name="employmentStatus" defaultValue={data.employmentStatus || 'Active'}><option>Active</option><option>On leave</option><option>Inactive</option></select></label>
          <label className="form-field"><span>Start date</span><input type="date" name="hireDate" defaultValue={data.hireDate || ''} /></label>
          <label className="form-field"><span>Annual salary</span><input type="number" name="salary" min="0" step="1000" defaultValue={data.salary || ''} /></label>
        </div> : <div className="form-grid">
          <label className="form-field full"><span>Department name</span><input name="name" defaultValue={data.name || ''} required /></label>
          <label className="form-field full"><span>Description</span><textarea name="description" rows="3" defaultValue={data.description || ''} /></label>
        </div>}
        {error && <div className="login-error" role="alert">{error}</div>}
        <div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> Save {isEmployee ? 'employee' : 'department'}</>}</button></div>
      </form>
    </section>
  </div>
}

export default App
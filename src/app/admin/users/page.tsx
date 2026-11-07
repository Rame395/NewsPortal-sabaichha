'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import {
  PERMISSION_DEFINITIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PermissionKey,
} from '@/lib/auth/permissions'
import {
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit,
  X,
  AlertCircle,
  Users as UsersIcon,
  Search,
  Lock,
  Mail,
} from 'lucide-react'

interface StaffMember {
  id: string
  fullName: string
  email: string
  role: string
  permissions: string[]
  mustChangePassword: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  _count: {
    articles: number
  }
}

export default function UsersManagementPage() {
  const { language } = useLanguage()

  const [users, setUsers] = React.useState<StaffMember[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<StaffMember | null>(null)

  // Form State
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [selectedRole, setSelectedRole] = React.useState('JOURNALIST')
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(
    ROLE_DEFAULT_PERMISSIONS['JOURNALIST']
  )
  const [mustChangePassword, setMustChangePassword] = React.useState(true)
  const [sendCredentialsEmail, setSendCredentialsEmail] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch users on mount
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Failed to load staff list.')
      }
    } catch {
      setError('Network error while loading staff.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  // Handle Role selection: auto-populate default permissions
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole)
    const defaults = ROLE_DEFAULT_PERMISSIONS[newRole] || []
    setSelectedPermissions(defaults)
  }

  // Toggle individual permission checkbox
  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== key))
    } else {
      setSelectedPermissions([...selectedPermissions, key])
    }
  }

  // Open "Add Staff" modal
  const openAddModal = () => {
    setEditingUser(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setSelectedRole('JOURNALIST')
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS['JOURNALIST'])
    setMustChangePassword(true)
    setSendCredentialsEmail(true)
    setError(null)
    setIsModalOpen(true)
  }

  // Open "Edit Permissions" modal
  const openEditModal = (u: StaffMember) => {
    setEditingUser(u)
    setFullName(u.fullName)
    setEmail(u.email)
    setPassword('')
    setSelectedRole(u.role)
    setSelectedPermissions(u.permissions || [])
    setMustChangePassword(u.mustChangePassword)
    setSendCredentialsEmail(true)
    setError(null)
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (editingUser) {
        // Update existing user permissions / role / password
        const payload: Record<string, unknown> = {
          role: selectedRole,
          permissions: selectedPermissions,
          sendNotificationEmail: sendCredentialsEmail,
        }
        if (password) {
          payload.newPassword = password
        }

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update user.')

        setSuccessMsg(
          language === 'ne'
            ? 'कर्मचारी विवरण सफलतापूर्वक अद्यावधिक भयो।'
            : 'Staff permissions successfully updated.'
        )
      } else {
        // Create new user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            email,
            password,
            role: selectedRole,
            permissions: selectedPermissions,
            mustChangePassword,
            sendWelcomeEmail: sendCredentialsEmail,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create user.')

        const emailNote = data.emailStatus?.sent
          ? (language === 'ne' ? ' (लगइन विवरण इमेल पठाइयो)' : ' (Credentials emailed)')
          : ''

        setSuccessMsg(
          language === 'ne'
            ? `नयाँ कर्मचारी खाता सफलतापूर्वक सिर्जना भयो${emailNote}।`
            : `New staff member successfully created${emailNote}.`
        )
      }

      setIsModalOpen(false)
      fetchUsers()
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Operation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle user active status
  const toggleUserStatus = async (user: StaffMember) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (res.ok) {
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to change status.')
      }
    } catch {
      alert('Network error.')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roleBadges: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400 border-red-300 dark:border-red-800',
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    JOURNALIST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    MODERATOR: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    CUSTOM: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'कर्मचारी तथा भूमिका व्यवस्थापन' : 'Staff & Role-Based Access Control'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'सुपर एडमिनले कर्मचारीहरूलाई भूमिका र विशिष्ट सुविधाहरू तोक्न, सक्रिय/निष्क्रिय गर्न सक्छ।'
              : 'Super Admin can create staff accounts, customize dynamic feature permissions, and manage status.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'ne' ? 'नयाँ कर्मचारी थप्नुहोस्' : 'Add Staff Member'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === 'ne' ? 'नाम, इमेल वा भूमिका खोज्नुहोस्...' : 'Search staff by name, email, or role...'}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Staff Members Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{language === 'ne' ? 'कर्मचारी विवरण' : 'Staff Member'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'भूमिका' : 'Role'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'तोकिएका सुविधाहरू' : 'Assigned Features'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'स्थिति' : 'Status'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'समाचार' : 'Articles'}</th>
                <th className="px-5 py-3.5 text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    {language === 'ne' ? 'कर्मचारी सूची लोड हुँदैछ...' : 'Loading staff members...'}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    {language === 'ne' ? 'कुनै कर्मचारी फेला परेन।' : 'No staff members found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          roleBadges[u.role] || roleBadges.CUSTOM
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
                            {language === 'ne' ? '★ सबै नियन्त्रण अधिकार' : '★ All Platform Capabilities'}
                          </span>
                        ) : u.permissions && u.permissions.length > 0 ? (
                          <>
                            {u.permissions.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {p.split(':')[1]}
                              </span>
                            ))}
                            {u.permissions.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold">
                                +{u.permissions.length - 3} {language === 'ne' ? 'थप' : 'more'}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            {language === 'ne' ? 'कुनै सुविधा छैन' : 'No custom permissions'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                        title={language === 'ne' ? 'स्थिति बदल्न क्लिक गर्नुहोस्' : 'Click to toggle status'}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'ne' ? 'सक्रिय' : 'Active'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>{language === 'ne' ? 'निष्क्रिय' : 'Inactive'}</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {u._count.articles}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1"
                        title={language === 'ne' ? 'सुविधा सम्पादन गर्नुहोस्' : 'Edit Features & Permissions'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingUser
                    ? language === 'ne'
                      ? 'कर्मचारी सुविधा सम्पादन'
                      : 'Edit Staff Permissions'
                    : language === 'ne'
                    ? 'नयाँ कर्मचारी थप्नुहोस्'
                    : 'Create New Staff Member'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'ne'
                    ? 'भूमिका चयन गरी आवश्यकता अनुसार व्यक्तिगत सुविधाहरू छान्नुहोस्।'
                    : 'Select a base role and check the specific feature capabilities you want to grant.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-5">
              {!editingUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      {language === 'ne' ? 'पूरा नाम' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Ram Sharma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      {language === 'ne' ? 'इमेल' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@sabaichha.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {language === 'ne' ? 'आधार भूमिका' : 'Base Role'}
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="JOURNALIST">Journalist / Reporter (संवाददाता)</option>
                    <option value="EDITOR">Editor (सम्पादक)</option>
                    <option value="MODERATOR">Comment Moderator (प्रतिक्रिया व्यवस्थापक)</option>
                    <option value="ADMIN">Newsroom Administrator (प्रशासक)</option>
                    <option value="SUPER_ADMIN">Super Administrator (सुपर एडमिन)</option>
                    <option value="CUSTOM">Custom Role (अनुकूलित भूमिका)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {editingUser
                      ? language === 'ne'
                        ? 'नयाँ पासवर्ड (परिवर्तन नगर्ने भए खाली छोड्नुहोस्)'
                        : 'New Password (leave blank to keep current)'
                      : language === 'ne'
                      ? 'अस्थायी पासवर्ड (कम्तीमा ८ अक्षर)'
                      : 'Temporary Password (min 8 chars)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Granular Feature Permissions Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  {language === 'ne' ? 'विशिष्ट सुविधाहरू चयन गर्नुहोस् (Granular Permissions)' : 'Grant Specific Feature Permissions'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key)
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                            : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {language === 'ne' ? perm.labelNe : perm.labelEn}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'ne' ? perm.descriptionNe : perm.descriptionEn}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Automated Credentials Email Option */}
              <div className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendCredentialsEmail}
                    onChange={(e) => setSendCredentialsEmail(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    {editingUser
                      ? (language === 'ne'
                          ? 'इमेल मार्फत नयाँ भूमिका/पासवर्डको जानकारी पठाउनुहोस्'
                          : 'Send update notification email to user')
                      : (language === 'ne'
                          ? 'प्रयोगकर्ताको इमेलमा लगइन विवरण (इमेल र पासवर्ड) तुरुन्तै पठाउनुहोस्'
                          : 'Send login credentials (Email & Password) directly to user inbox')}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                  {language === 'ne'
                    ? 'कर्मचारीले आधिकारिक सम्पादकीय पोर्टल लिङ्क, तोकिएको भूमिका र लगइन पासवर्ड प्राप्त गर्नेछन्।'
                    : 'Dispatches an official SabaiChha onboarding email with portal URL, role badge, and temporary credentials.'}
                </p>
              </div>

              {!editingUser && (
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>
                    {language === 'ne'
                      ? 'पहिलो लगइनमा अनिवार्य रूपमा नयाँ पासवर्ड परिवर्तन गर्न लगाउने'
                      : 'Force user to change password upon their first sign in'}
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting
                    ? language === 'ne'
                      ? 'सुरक्षित हुँदैछ...'
                      : 'Saving...'
                    : editingUser
                    ? language === 'ne'
                      ? 'अद्यावधिक गर्नुहोस्'
                      : 'Update Staff'
                    : language === 'ne'
                    ? 'कर्मचारी सिर्जना गर्नुहोस्'
                    : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

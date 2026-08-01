export const API_STORAGE_KEYS = {
  token: 'claimcore_token',
  role: 'claimcore_role',
}

export const USER_ROLES = {
  patient: 'patient',
  insurer: 'insurer',
}

export const ROLE_HOME_PATH = {
  patient: '/patient',
  insurer: '/insurer',
}

export const STATUS_META = {
  Pending: {
    label: 'Pending',
    tone: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  Approved: {
    label: 'Approved',
    tone: 'bg-green-50 text-green-800 border-green-200',
  },
  Rejected: {
    label: 'Rejected',
    tone: 'bg-red-50 text-red-800 border-red-200',
  },
}

export const TABLE_EMPTY_MESSAGE = 'No claims found.'

export const formatCurrency = (value) => {
  const numericValue = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.Pending

export const getRoleLabel = (role) => {
  if (!role) {
    return 'User'
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const safeArray = (value) => (Array.isArray(value) ? value : [])

export const getClaimId = (claim) => claim?._id || claim?.id || ''

export const getClaimPatient = (claim) => claim?.patient?.name || claim?.name || '-'

export const getClaimEmail = (claim) => claim?.patient?.email || claim?.email || '-'

export const getClaimDate = (claim) => claim?.submittedAt || claim?.createdAt || claim?.updatedAt || null

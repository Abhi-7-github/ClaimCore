import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ClaimDetails from './pages/ClaimDetails'
import InsurerDashboard from './pages/InsurerDashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PatientDashboard from './pages/PatientDashboard'
import ReviewClaim from './pages/ReviewClaim'
import SubmitClaim from './pages/SubmitClaim'

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/submit" element={<SubmitClaim />} />
          <Route path="/patient/claims/:id" element={<ClaimDetails />} />
          <Route path="/patient/claims/:id/edit" element={<SubmitClaim />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['insurer']} />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/insurer" element={<InsurerDashboard />} />
          <Route path="/insurer/claims/:id" element={<ReviewClaim />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/track" element={<ComingSoon />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

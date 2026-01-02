import { Route, Routes } from 'react-router-dom'

import Home from '@/pages/Home'
import Plans from '@/pages/Plans'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:sport" element={<Home />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

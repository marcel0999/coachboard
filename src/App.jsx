import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Plantel from './pages/Plantel'
import Partidos from './pages/Partidos'
import Entrenamientos from './pages/Entrenamientos'
import CentroRendimiento from './pages/CentroRendimiento'
import CentroMedico from './pages/CentroMedico'
import StaffTecnico from './pages/StaffTecnico'
import PizarraTactica from './pages/PizarraTactica'
import Ejercicios from './pages/Ejercicios'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plantel" element={<Plantel />} />
        <Route path="partidos" element={<Partidos />} />
        <Route path="entrenamientos" element={<Entrenamientos />} />
        <Route path="rendimiento" element={<CentroRendimiento />} />
        <Route path="medico" element={<CentroMedico />} />
        <Route path="staff" element={<StaffTecnico />} />
        <Route path="pizarra" element={<PizarraTactica />} />
        <Route path="ejercicios" element={<Ejercicios />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  )
}

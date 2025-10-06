import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { CreateCV } from './pages/CreateCV';
import { AdminDashboard } from './pages/AdminDashboard';
import { EditCV } from './pages/EditCV';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-cv" element={<CreateCV />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/edit-cv/:id" element={<EditCV />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

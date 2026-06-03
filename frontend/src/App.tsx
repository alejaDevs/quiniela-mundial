import { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './views/Login/Login';
import { Register } from './views/Register/Register';
import { Dashboard } from './views/Dashboard/Dashboard';
import { MisPredicciones } from './views/MisPredicciones/MisPredicciones';
import { Resultados } from './views/Resultados/Resultados';
import { Leaderboard } from './views/Leaderboard/Leaderboard';
import { Admin } from './views/Admin/Admin';
import { CambiarContrasena } from './views/CambiarContrasena/CambiarContrasena';

export const App = (): ReactElement => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mis-predicciones" element={<MisPredicciones />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cambiar-contrasena"
              element={<CambiarContrasena />}
            />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

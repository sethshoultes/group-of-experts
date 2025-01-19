import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DebugProvider } from './contexts/DebugContext';
import Header from './components/layout/Header';
import DebugPanel from './components/debug/DebugPanel';
import DiscussionView from './components/discussion/DiscussionView';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Discussions from './components/discussion/Discussions';
import Profile from './components/profile/Profile';
import NewDiscussion from './components/discussion/NewDiscussion';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <DebugProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/new"
              element={
                <ProtectedRoute>
                  <NewDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/:id"
              element={
                <ProtectedRoute>
                  <DiscussionView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Discussions />
                </ProtectedRoute>
              }
            />
          </Routes>
          <DebugPanel />
        </div>
      </Router>
      </DebugProvider>
    </AuthProvider>
  );
}
export default App;
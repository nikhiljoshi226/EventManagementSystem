// client/src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import SponsorDashboard from './components/SponsorDashboard';
import MentorDashboard from './components/MentorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Layout showHeaderAndFooter={false}>
              <Login />
            </Layout>
          } 
        />
        
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute allowedRoles={['Faculty']}>
              <Layout>
                <FacultyDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sponsor" 
          element={
            <ProtectedRoute allowedRoles={['Sponsor']}>
              <Layout>
                <SponsorDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mentor" 
          element={
            <ProtectedRoute allowedRoles={['Mentor']}>
              <Layout>
                <MentorDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
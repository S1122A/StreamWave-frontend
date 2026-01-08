import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import ConsumerSignup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ConsumerHome from './pages/consumer/Home';
import ConsumerVideoDetails from './pages/consumer/VideoDetails';
import LikedVideos from './pages/consumer/LikedVideos';
import CreatorDashboard from './pages/creator/Dashboard';
import MyVideos from './pages/creator/MyVideos';
import AuthService from './config/auth';

// Careem-inspired theme
const theme = extendTheme({
  colors: {
    brand: {
      primary: '#00B14F',    // Careem Green
      secondary: '#FFFFFF',  // White
      accent: '#2D3748',     // Dark Gray
      light: '#F7FAFC',      // Light Gray
      text: '#1A202C'        // Dark Text
    }
  },
  styles: {
    global: {
      body: {
        bg: 'brand.secondary',
        color: 'brand.text',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: '8px',
        _focus: {
          boxShadow: '0 0 0 3px rgba(0, 177, 79, 0.1)'
        }
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: '#009A45',
            transform: 'translateY(-1px)',
            boxShadow: 'lg'
          }
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary',
          _hover: {
            bg: 'brand.primary',
            color: 'white'
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid',
          borderColor: 'gray.100'
        }
      }
    }
  }
});

function PrivateRoute({ children, allowedRoles }) {
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<ConsumerSignup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/creator/dashboard" 
            element={
              <PrivateRoute allowedRoles={['creator']}>
                <CreatorDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/creator/my-videos" 
            element={
              <PrivateRoute allowedRoles={['creator']}>
                <MyVideos />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/consumer/video/:videoId" 
            element={
              <PrivateRoute allowedRoles={['consumer']}>
                <ConsumerVideoDetails />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/consumer/home" 
            element={
              <PrivateRoute allowedRoles={['consumer']}>
                <ConsumerHome />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/consumer/liked" 
            element={
              <PrivateRoute allowedRoles={['consumer']}>
                <LikedVideos />
              </PrivateRoute>
            } 
          />
          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;

// client/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  TextField,
  Divider,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import api from '../api';

const LoginContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '450px',
  margin: '2rem auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: '8px',
}));

const LoginHeader = styled(Box)({
  width: '100%',
  backgroundColor: '#500000',
  color: 'white',
  padding: '16px',
  marginBottom: '24px',
  borderRadius: '4px 4px 0 0',
  textAlign: 'center',
  marginTop: '-32px',
  marginLeft: '-32px',
  marginRight: '-32px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/users/login', { email });
      const { _id, role, name } = response.data;
      
      // Store user data in localStorage
      localStorage.setItem('userId', _id);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      
      // Redirect based on role
      switch(role.toLowerCase()) {
        case 'student':
          navigate('/student');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'sponsor':
          navigate('/sponsor');
          break;
        default:
          setError('Unknown role. Please contact support.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <LoginContainer elevation={3}>
        <LoginHeader>
          <School sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            CMIS Portal
          </Typography>
        </LoginHeader>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: '#500000',
              '&:hover': {
                backgroundColor: '#300000',
              },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Divider sx={{ my: 3 }}>OR</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<School />}
            href="https://cas.tamu.edu/cas/login"
            sx={{
              py: 1.5,
              borderColor: '#500000',
              color: '#500000',
              '&:hover': {
                borderColor: '#300000',
                backgroundColor: 'rgba(80, 0, 0, 0.04)',
              },
            }}
          >
            Sign in with TAMU CAS
          </Button>
        </Box>
      </LoginContainer>
    </Container>
  );
};

export default Login;
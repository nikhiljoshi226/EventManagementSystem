// client/src/components/Layout.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Container, 
  Box, 
  Typography,
  Link,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#500000',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const Footer = styled('footer')(({ theme }) => ({
  backgroundColor: '#500000',
  color: 'white',
  padding: theme.spacing(4, 0),
  marginTop: 'auto',
}));

const Layout = ({ children, showHeaderAndFooter = true }) => {
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const isAuthenticated = !!userRole;

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      {showHeaderAndFooter && (
        <StyledAppBar position="static">
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 'bold'
                }}
              >
                <Link 
                  component={RouterLink} 
                  to={isAuthenticated ? `/${userRole.toLowerCase()}` : '/'} 
                  color="inherit" 
                  underline="none"
                >
                  CMIS Engagement Portal
                </Link>
              </Typography>
              <Box>
                {isAuthenticated ? (
                  <>
                    <Button 
                      color="inherit" 
                      component={RouterLink} 
                      to={`/${userRole.toLowerCase()}`}
                      sx={{ mx: 1 }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      color="inherit" 
                      onClick={handleLogout}
                      variant="outlined"
                      sx={{ 
                        ml: 1,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/login"
                    variant="outlined"
                    sx={{ 
                      ml: 1,
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Login
                  </Button>
                )}
              </Box>
            </Toolbar>
          </Container>
        </StyledAppBar>
      )}

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {showHeaderAndFooter && (
        <Footer>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Mays Business School
                </Typography>
                <Typography variant="body2">
                  4113 TAMU<br />
                  College Station, TX 77843-4113
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Quick Links
                </Typography>
                <Link href="https://mays.tamu.edu/" color="inherit" display="block" gutterBottom>
                  Mays Business School
                </Link>
                <Link href="https://www.tamu.edu/" color="inherit" display="block" gutterBottom>
                  Texas A&M University
                </Link>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" align="right">
                  &copy; {new Date().getFullYear()} Texas A&M University<br />
                  All Rights Reserved
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Footer>
      )}
    </Box>
  );
};

export default Layout;
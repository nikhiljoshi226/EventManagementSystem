// client/src/components/Home.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(8, 0),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  backgroundImage: 'linear-gradient(rgba(80, 0, 0, 0.8), rgba(80, 0, 0, 0.8)), url(https://brandguide.tamu.edu/assets/img/logos/tam-box-logo.png)',
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const PortalButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(2),
  minWidth: '200px',
  fontWeight: 'bold',
  '&.student': {
    backgroundColor: '#500000',
    '&:hover': {
      backgroundColor: '#300000',
    },
  },
  '&.faculty': {
    backgroundColor: '#003C71',
    '&:hover': {
      backgroundColor: '#002B4F',
    },
  },
  '&.sponsor': {
    backgroundColor: '#5F6236',
    '&:hover': {
      backgroundColor: '#3E4124',
    },
  },
}));

const Home = () => {
  return (
    <>
      <HeroSection>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom>
            Mays Business School
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            CMIS Engagement Portal
          </Typography>
          <Typography variant="h6" component="p" gutterBottom>
            Connecting Aggies with Industry Leaders
          </Typography>
        </Container>
      </HeroSection>

      <Container maxWidth="lg">
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Access Your Portal
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2,
              mt: 3,
              mb: 2
            }}>
              <PortalButton 
                component={Link} 
                to="/student"
                variant="contained" 
                className="student"
                size="large"
              >
                Student Portal
              </PortalButton>
              <PortalButton 
                component={Link} 
                to="/faculty"
                variant="contained" 
                className="faculty"
                size="large"
              >
                Faculty Portal
              </PortalButton>
              <PortalButton 
                component={Link} 
                to="/sponsor"
                variant="contained" 
                className="sponsor"
                size="large"
              >
                Partner Portal
              </PortalButton>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  For Students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with top employers, find internship opportunities, and attend exclusive events.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  For Faculty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage student engagement, track participation, and connect with industry partners.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  For Partners
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with top Aggie talent, post opportunities, and engage with students.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Home;
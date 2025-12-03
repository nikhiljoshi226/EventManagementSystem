// client/src/components/SponsorDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Badge,
  CardActionArea,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  Event as EventIcon, 
  People as PeopleIcon, 
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon,
  GroupAdd as GroupAddIcon,
  EventAvailable as EventAvailableIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { api, getAuthConfig } from '../utils/api';
import Layout from './Layout';

// TAMU Color Palette
const TAMU_MAROON = '#500000';
const TAMU_WHITE = '#FFFFFF';
const TAMU_GRAY = '#D6D3C4';
const TAMU_ACCENT = '#FFD600';

// Custom styled components with TAMU theme
const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: 12,
  background: 'white',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  color: TAMU_MAROON,
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  '& svg': {
    color: TAMU_ACCENT
  }
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5, 2),
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5)
  }
}));

// Mock data for analytics
const mockAnalytics = {
  totalRegistrations: 124,
  eventsHosted: 8,
  upcomingEvents: 3,
  averageAttendance: 78
};

const SponsorDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Sponsor', email: 'sponsor@tamu.edu' });

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('Current user data from localStorage:', userData);
        
        // For development: Temporarily allow access without role check
        if (!userData) {
          console.log('No user data found, using demo sponsor account');
          const demoUser = { 
            name: 'Demo Sponsor', 
            email: 'sponsor@tamu.edu',
            role: 'sponsor',
            _id: 'sponsor-demo-id'
          };
          setUser(demoUser);
          localStorage.setItem('user', JSON.stringify(demoUser));
          await fetchDashboardData();
          return;
        }
        
        // Set user and fetch data regardless of role for now
        console.log('Using existing user data');
        setUser(userData);
        await fetchDashboardData();
        
      } catch (error) {
        console.error('Authentication check failed, using demo mode:', error);
        // Continue in demo mode instead of redirecting
        const demoUser = { 
          name: 'Demo Sponsor', 
          email: 'sponsor@tamu.edu',
          role: 'sponsor',
          _id: 'sponsor-demo-id'
        };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        await fetchDashboardData();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data first
      try {
        const response = await api.get('/dashboard/sponsor', getAuthConfig());
        if (response.data) {
          setRegistrations(response.data.registrations || []);
          return;
        }
      } catch (apiError) {
        console.warn('Using mock data due to API error:', apiError);
        // Continue to use mock data below
      }
      
      // Fallback to mock data
      setRegistrations([
        {
          _id: '1',
          user: {
            name: 'John Doe',
            email: 'john.doe@tamu.edu',
            resumeUrl: '/resumes/john_doe.pdf'
          },
          event: {
            title: 'Web Development Workshop',
            tags: ['Workshop', 'Web Dev']
          },
          createdAt: new Date().toISOString()
        },
        // Add more mock registrations as needed
      ]);
      
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError('Failed to load dashboard data. Using demo data instead.');
      
      // Ensure we have some data to display even if everything fails
      setRegistrations([
        {
          _id: 'demo-1',
          user: {
            name: 'Demo Student',
            email: 'demo@tamu.edu',
            resumeUrl: null
          },
          event: {
            title: 'Demo Event',
            tags: ['Demo']
          },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      window.open(`http://127.0.0.1:5000/${resumeUrl}`, '_blank');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.event?.tags?.includes(filter);
  });

  // Show loading state only if we don't have any data yet
  if (loading && !registrations.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <CircularProgress />
        <Typography color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with Welcome Message */}
        <Box 
          sx={{ 
            bgcolor: TAMU_MAROON,
            color: 'white',
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            mb: 4,
            boxShadow: 3,
            background: `linear-gradient(135deg, ${TAMU_MAROON} 0%, ${alpha(TAMU_MAROON, 0.9)} 100%)`,
            overflow: 'hidden',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.1) 0%, transparent 40%)',
              zIndex: 0,
            }
          }}
        >
          <Grid container spacing={3} alignItems="center" position="relative" zIndex={1}>
            <Grid item xs={12} md={8}>
              <Box sx={{ maxWidth: '800px' }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  fontWeight={700} 
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  Welcome back,{' '}
                  <Box component="span" sx={{ color: TAMU_ACCENT }}>
                    {user?.name?.split(' ')[0] || 'Sponsor'}!
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9, 
                    mb: 4, 
                    maxWidth: '90%',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.6
                  }}
                >
                  Manage your events, view registrations, and track engagement with students.
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    size="large"
                    sx={{
                      bgcolor: TAMU_ACCENT,
                      color: TAMU_MAROON,
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: alpha(TAMU_ACCENT, 0.9),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      },
                      px: { xs: 3, sm: 4 },
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: { xs: '100%', sm: 'auto' },
                      textAlign: 'center',
                    }}
                    startIcon={<EventAvailableIcon />}
                    onClick={() => navigate('/create-event')}
                  >
                    Host New Event
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.4)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.15)',
                        borderColor: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      px: { xs: 3, sm: 4 },
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: { xs: '100%', sm: 'auto' },
                      textAlign: 'center',
                    }}
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/analytics')}
                  >
                    View Analytics
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                    {registrations.length}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Registrations
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(TAMU_MAROON, 0.1),
                    color: TAMU_MAROON,
                    p: 1.5,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <AssignmentIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                    {mockAnalytics.eventsHosted}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Events Hosted
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha('#1976d2', 0.1),
                    color: '#1976d2',
                    p: 1.5,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <EventIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                    {mockAnalytics.upcomingEvents}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Upcoming Events
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha('#ed6c02', 0.1),
                    color: '#ed6c02',
                    p: 1.5,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <EventAvailableIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box>
                <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                  {mockAnalytics.averageAttendance}%
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Avg. Attendance
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockAnalytics.averageAttendance} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${TAMU_MAROON}, ${TAMU_ACCENT})`,
                        borderRadius: 4,
                      },
                      backgroundColor: alpha(TAMU_MAROON, 0.1),
                    }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                  {mockAnalytics.averageAttendance >= 70 ? 'Above average' : 'On track'}
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <DashboardCard>
              <CardContent>
                <SectionTitle variant="h6">
                  <EventAvailableIcon /> Quick Actions
                </SectionTitle>
                <Box display="flex" flexDirection="column" gap={2}>
                  <QuickActionButton
                    variant="contained"
                    fullWidth
                    sx={{ 
                      bgcolor: TAMU_MAROON,
                      color: TAMU_WHITE,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.9),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.2)}`,
                      },
                      py: 1.8,
                      borderRadius: '8px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                    startIcon={<EventAvailableIcon />}
                    onClick={() => navigate('/create-event')}
                  >
                    Create New Event
                  </QuickActionButton>
                  
                  <QuickActionButton
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05),
                        borderColor: TAMU_MAROON,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                      },
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/analytics')}
                  >
                    View Analytics
                  </QuickActionButton>
                  
                  <QuickActionButton
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05),
                        borderColor: TAMU_MAROON,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                      },
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/students')}
                  >
                    View Students
                  </QuickActionButton>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Recent Registrations */}
          <Grid item xs={12} lg={8}>
            <DashboardCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <SectionTitle variant="h6" sx={{ mb: 0 }}>
                    Recent Registrations
                  </SectionTitle>
                  <Box sx={{ width: 250 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="filter-label">Filter by Interest</InputLabel>
                      <Select
                        labelId="filter-label"
                        value={filter}
                        label="Filter by Interest"
                        onChange={(e) => setFilter(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Interests</MenuItem>
                        {Array.from(
                          new Set(registrations.flatMap(reg => reg.event?.tags || []))
                        ).map((tag, i) => (
                          <MenuItem key={i} value={tag}>{tag}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Event</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Resume</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((reg) => (
                          <TableRow 
                            key={reg._id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                            onClick={() => navigate(`/registrations/${reg._id}`)}
                          >
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {reg.user?.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {reg.user?.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {reg.event?.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                {reg.event?.tags?.map((tag, i) => (
                                  <Box 
                                    key={i} 
                                    sx={{
                                      bgcolor: alpha(TAMU_MAROON, 0.1),
                                      color: TAMU_MAROON,
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      fontSize: '0.7rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {tag}
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(reg.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {reg.user?.resumeUrl ? (
                                <Button
                                  variant="text"
                                  size="small"
                                  startIcon={<FileDownloadIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadResume(reg.user.resumeUrl);
                                  }}
                                  sx={{
                                    color: TAMU_MAROON,
                                    '&:hover': {
                                      bgcolor: alpha(TAMU_MAROON, 0.05)
                                    }
                                  }}
                                >
                                  View
                                </Button>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Not available
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              No registrations found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </DashboardCard>
          </Grid>
        </Grid>
      </Container>
  );
};

export default SponsorDashboard;
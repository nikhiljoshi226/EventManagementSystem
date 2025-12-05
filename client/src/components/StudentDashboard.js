// client/src/components/StudentDashboard.js
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
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Badge,
  CardActionArea,
  Alert
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  Event as EventIcon, 
  School as SchoolIcon, 
  Announcement as AnnouncementIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Bookmark as BookmarkIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { api } from '../utils/api';
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

// Mock data for events
const mockEvents = [
  {
    _id: '1',
    title: 'Web Development Workshop',
    date: new Date(Date.now() + 86400000).toISOString(),
    type: 'Workshop',
    location: 'Zachry 123',
    description: 'Learn modern web development techniques',
    tags: ['Web Dev', 'Coding']
  },
  {
    _id: '2',
    title: 'Networking Mixer',
    date: new Date(Date.now() + 172800000).toISOString(),
    type: 'Networking',
    location: 'MSC 2300',
    description: 'Connect with industry professionals',
    tags: ['Career', 'Networking']
  },
  {
    _id: '3',
    title: 'Research Symposium',
    date: new Date(Date.now() + 259200000).toISOString(),
    type: 'Conference',
    location: 'ILSB Auditorium',
    description: 'Present your research to faculty and peers',
    tags: ['Research', 'Presentation']
  }
];

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { 
    name: 'Student', 
    email: 'student@tamu.edu',
    role: 'student',
    _id: 'student-demo-id'
  });

  // Stats state
  const [stats, setStats] = useState({
    registeredEvents: 5,
    upcomingEvents: 3,
    completedHours: 12,
    announcements: 2
  });

  // Check authentication and fetch data on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        
        // For development: Temporarily allow access without role check
        if (!userData) {
          console.log('No user data found, using demo student account');
          const demoUser = { 
            name: 'Demo Student', 
            email: 'student@tamu.edu',
            role: 'student',
            _id: 'student-demo-id'
          };
          setUser(demoUser);
          localStorage.setItem('user', JSON.stringify(demoUser));
          await fetchDashboardData();
          return;
        }
        
        // Set user and fetch data regardless of role for now
        setUser(userData);
        await fetchDashboardData();
        
      } catch (error) {
        console.error('Authentication check failed, using demo mode:', error);
        // Continue in demo mode instead of redirecting
        const demoUser = { 
          name: 'Demo Student', 
          email: 'student@tamu.edu',
          role: 'student',
          _id: 'student-demo-id'
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
      // Try to fetch real data first
      try {
        const [eventsResponse] = await Promise.all([
          api.get('/events')
        ]);
        
        if (eventsResponse?.data) {
          setEvents(eventsResponse.data);
        }
        
      } catch (apiError) {
        console.warn('Using mock data due to API error:', apiError);
        // Fallback to mock data
        setEvents(mockEvents);
      }
      
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError('Failed to load dashboard data. Using demo data instead.');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state only if we don't have any data yet
  if (loading && !events.length) {
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
                    {user?.name?.split(' ')[0] || 'Student'}!
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
                  Track your events, registrations, and announcements in one place.
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
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/events')}
                  >
                    Browse Events
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
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate('/my-courses')}
                  >
                    My Courses
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
                    {stats.registeredEvents}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registered Events
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
                    {stats.upcomingEvents}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Upcoming Events
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
                  <CalendarIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                    {stats.completedHours}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed Hours
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
                  <CheckCircleIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box>
                <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                  {stats.announcements}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  New Announcements
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.announcements / 5) * 100} 
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
                  {stats.announcements > 0 ? 'New updates available' : 'No new updates'}
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Upcoming Events */}
          <Grid item xs={12} lg={8}>
            <DashboardCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <SectionTitle variant="h6" sx={{ mb: 0 }}>
                    <EventIcon /> Upcoming Events
                  </SectionTitle>
                  <Button 
                    color="primary" 
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    sx={{ color: TAMU_MAROON }}
                    onClick={() => navigate('/events')}
                  >
                    View All
                  </Button>
                </Box>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : events.length > 0 ? (
                  <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                    {events.slice(0, 3).map((event) => (
                      <Card 
                        key={event._id} 
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: alpha(TAMU_MAROON, 0.5),
                            boxShadow: `0 2px 8px ${alpha(TAMU_MAROON, 0.08)}`,
                          },
                        }}
                      >
                        <CardActionArea onClick={() => navigate(`/events/${event._id}`)}>
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={3}>
                                <Box 
                                  display="flex" 
                                  alignItems="center" 
                                  color={TAMU_MAROON}
                                  mb={1}
                                >
                                  <CalendarIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {formatDate(event.date)}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={event.type} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: alpha(TAMU_MAROON, 0.1),
                                    color: TAMU_MAROON,
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 24
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={9}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {event.title}
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <SchoolIcon fontSize="small" sx={{ mr: 1, opacity: 0.7, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {event.location}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {event.description?.length > 100 
                                    ? `${event.description.substring(0, 100)}...` 
                                    : event.description}
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                                  {event.tags?.map((tag, index) => (
                                    <Chip 
                                      key={index} 
                                      label={tag} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: alpha(TAMU_MAROON, 0.1),
                                        color: TAMU_MAROON,
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        height: 24,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }} 
                                    />
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary" gutterBottom>
                      No upcoming events found.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => navigate('/events')}
                    >
                      Browse Events
                    </Button>
                  </Box>
                )}
              </CardContent>
            </DashboardCard>

            {/* Quick Actions */}
            <DashboardCard sx={{ mt: 3 }}>
              <CardContent>
                <SectionTitle variant="h6">
                  <AssignmentIcon /> Quick Actions
                </SectionTitle>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EventAvailableIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05),
                        borderColor: TAMU_MAROON,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => navigate('/events')}
                  >
                    Register for Events
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<BookmarkIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05),
                        borderColor: TAMU_MAROON,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => navigate('/saved-events')}
                  >
                    View Saved Events
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<GroupIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05),
                        borderColor: TAMU_MAROON,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => navigate('/student-groups')}
                  >
                    Join Student Groups
                  </Button>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Announcements and Quick Links */}
          <Grid item xs={12} lg={4}>
            <DashboardCard>
              <CardContent>
                <SectionTitle variant="h6">
                  <AnnouncementIcon /> Announcements
                </SectionTitle>
                
                <Box sx={{ '& > *:not(:last-child)': { mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' } }}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box 
                        sx={{
                          bgcolor: alpha(TAMU_MAROON, 0.1),
                          color: TAMU_MAROON,
                          p: 0.75,
                          borderRadius: '50%',
                          display: 'flex',
                          mr: 1.5
                        }}
                      >
                        <AnnouncementIcon fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        New Course Available
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 5.5 }}>
                      Enroll now to learn the fundamentals of web development with our new course.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 5.5, display: 'block' }}>
                      Posted 2 days ago
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box 
                        sx={{
                          bgcolor: alpha(TAMU_MAROON, 0.1),
                          color: TAMU_MAROON,
                          p: 0.75,
                          borderRadius: '50%',
                          display: 'flex',
                          mr: 1.5
                        }}
                      >
                        <AnnouncementIcon fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        System Maintenance
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 5.5 }}>
                      The platform will be undergoing maintenance on December 15th from 2 AM to 4 AM EST.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 5.5, display: 'block' }}>
                      Posted 1 week ago
                    </Typography>
                  </Box>
                </Box>
                
                <Box mt={3}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderColor: alpha(TAMU_MAROON, 0.3),
                      color: TAMU_MAROON,
                      '&:hover': {
                        borderColor: TAMU_MAROON,
                        bgcolor: alpha(TAMU_MAROON, 0.05)
                      }
                    }}
                  >
                    View All Announcements
                  </Button>
                </Box>
              </CardContent>
            </DashboardCard>
            
            {/* Upcoming Deadlines */}
            <DashboardCard sx={{ mt: 3 }}>
              <CardContent>
                <SectionTitle variant="h6">
                  <CalendarIcon /> Upcoming Deadlines
                </SectionTitle>
                
                <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alpha('#1976d2', 0.05),
                      borderLeft: `3px solid #1976d2`
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Assignment 1 - Web Dev
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: Dec 10, 2023
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alpha('#ed6c02', 0.05),
                      borderLeft: `3px solid #ed6c02`
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Project Proposal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: Dec 15, 2023
                    </Typography>
                  </Box>
                </Box>
                
                <Box mt={2}>
                  <Button 
                    fullWidth 
                    variant="text" 
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      color: TAMU_MAROON,
                      '&:hover': {
                        bgcolor: alpha(TAMU_MAROON, 0.05)
                      }
                    }}
                  >
                    View All Deadlines
                  </Button>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>
        </Grid>
      </Container>
  );
};

export default StudentDashboard;

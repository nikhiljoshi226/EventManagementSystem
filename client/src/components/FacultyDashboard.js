// client/src/components/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  CardActions
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
  EventAvailable as EventAvailableIcon
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
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease-in-out',
  borderTop: `4px solid ${TAMU_MAROON}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(80,0,0,0.12)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  borderRadius: '12px',
  textAlign: 'center',
  color: TAMU_MAROON,
  background: `linear-gradient(145deg, ${alpha(TAMU_MAROON, 0.1)}, ${alpha(TAMU_MAROON, 0.05)})`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 20px ${alpha(TAMU_MAROON, 0.15)}`,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: TAMU_MAROON,
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `2px solid ${TAMU_GRAY}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5, 2),
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1.5),
    color: 'inherit',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 8,
    top: 8,
    padding: '0 4px',
    backgroundColor: TAMU_ACCENT,
    color: TAMU_MAROON,
    fontWeight: 'bold',
  },
}));

const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingEvents: 0,
    pendingApprovals: 5,
    recentActivities: [],
    studentProgress: 68,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Faculty Member', email: 'faculty@tamu.edu' });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mock data for recent activities
  const mockActivities = [
    { 
      id: 1, 
      type: 'event', 
      title: 'New event: Web Development Workshop', 
      date: '2023-12-10', 
      description: 'Registration is now open for all students',
      action: 'View Details',
      icon: EventIcon
    },
    { 
      id: 2, 
      type: 'announcement', 
      title: 'New Research Grant Opportunity', 
      date: '2023-12-05',
      description: 'Applications due by December 20th',
      action: 'Learn More',
      icon: AnnouncementIcon
    },
    { 
      id: 3, 
      type: 'approval', 
      title: '5 pending approvals', 
      date: '2023-12-08',
      description: 'Student event registrations need review',
      action: 'Review Now',
      icon: AssignmentIcon
    },
  ];

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('Current user data from localStorage:', userData);
        
        // For development: Temporarily allow access without role check
        if (!userData) {
          console.log('No user data found, using demo faculty account');
          const demoUser = { 
            name: 'Demo Faculty', 
            email: 'faculty@tamu.edu',
            role: 'faculty' 
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
          name: 'Demo Faculty', 
          email: 'faculty@tamu.edu',
          role: 'faculty' 
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
        const response = await api.get('/dashboard/faculty', getAuthConfig());
        if (response.data) {
          setStats(prev => ({
            ...prev,
            ...response.data,
            // Ensure we always have all required fields, fallback to mock if missing
            recentActivities: response.data.recentActivities || mockActivities,
          }));
          return;
        }
      } catch (apiError) {
        console.warn('Using mock data due to API error:', apiError);
        // Continue to use mock data below
      }
      
      // Fallback to mock data
      setStats({
        totalStudents: 247,
        upcomingEvents: 8,
        pendingApprovals: 5,
        recentActivities: mockActivities,
        studentProgress: 68,
      });
      
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError('Failed to load dashboard data. Using demo data instead.');
      
      // Ensure we have some data to display even if everything fails
      setStats(prev => ({
        ...prev,
        recentActivities: mockActivities,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  // Show loading state only if we don't have any data yet
  if (loading && !stats.recentActivities?.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <CircularProgress />
        <Typography color="text.secondary">Loading dashboard...</Typography>
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
            <Grid item xs={12} md={7} lg={8}>
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
                    {user?.name?.split(' ')[0] || 'Professor'}!
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
                  Here's what's happening with your students today. Manage your courses, track progress, and stay updated with the latest activities.
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
                    startIcon={<TrendingUpIcon />}
                    onClick={() => navigate('/analytics')}
                  >
                    View Analytics
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
                    startIcon={<EventAvailableIcon />}
                    onClick={() => navigate('/events')}
                  >
                    View Calendar
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Students
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
                  <PeopleIcon />
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
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Approvals
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
                  <PendingIcon />
                </Box>
              </Box>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box>
                <Typography variant="h4" component="div" fontWeight={800} sx={{ mb: 0.5 }}>
                  {stats.studentProgress}%
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Student Progress
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.studentProgress} 
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
                  {stats.studentProgress >= 70 ? 'Ahead of schedule' : 'On track'}
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        {/* Dashboard Content */}
        <Grid container spacing={3} sx={{ mt: 8, mb: 6 }}>
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
                    onClick={() => navigate('/events/create')}
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
                    startIcon={<GroupAddIcon />}
                    onClick={() => navigate('/students/manage')}
                  >
                    Manage Students
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
                    onClick={() => navigate('/reports')}
                  >
                    View Reports
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
                    startIcon={<AnnouncementIcon />}
                    onClick={() => navigate('/announcements')}
                  >
                    Post Announcement
                  </QuickActionButton>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={8}>
            <DashboardCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <SectionTitle variant="h6" sx={{ mb: 0 }}>
                    Recent Activity
                  </SectionTitle>
                  <Button 
                    color="primary" 
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    sx={{ color: TAMU_MAROON }}
                  >
                    View All
                  </Button>
                </Box>
                
                <Card 
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: alpha(TAMU_MAROON, 0.5),
                      boxShadow: `0 2px 12px ${alpha(TAMU_MAROON, 0.1)}`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box 
                    sx={{
                      display: 'flex',
                      overflowX: 'auto',
                      p: 2,
                      '& > * + *': {
                        ml: 2, 
                      },
                      '&::-webkit-scrollbar': {
                        height: '6px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(TAMU_MAROON, 0.3),
                        borderRadius: '3px',
                        '&:hover': {
                          backgroundColor: alpha(TAMU_MAROON, 0.5),
                        }
                      }
                    }}
                  >
                    {stats.recentActivities.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <CardActionArea 
                          key={activity.id}
                          onClick={() => {
                            if (activity.type === 'event') navigate('/events');
                            else if (activity.type === 'announcement') navigate('/announcements');
                            else if (activity.type === 'approval') navigate('/approvals');
                          }}
                          sx={{
                            minWidth: 280,
                            width: 280,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: alpha(TAMU_MAROON, 0.3),
                              backgroundColor: alpha(TAMU_MAROON, 0.02),
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Box display="flex" alignItems="flex-start">
                            <Box 
                              sx={{
                                bgcolor: alpha(TAMU_MAROON, 0.1),
                                color: TAMU_MAROON,
                                p: 1.25,
                                borderRadius: '50%',
                                display: 'flex',
                                mr: 2,
                                flexShrink: 0,
                                mt: 0.5,
                              }}
                            >
                              <IconComponent fontSize="small" />
                            </Box>
                            <Box flex={1}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                  {activity.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                                  {new Date(activity.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8125rem' }}>
                                {activity.description}
                              </Typography>
                              <Button 
                                size="small" 
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                sx={{ 
                                  color: TAMU_MAROON, 
                                  fontSize: '0.75rem',
                                  p: 0,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: 'underline',
                                  }
                                }}
                              >
                                {activity.action}
                              </Button>
                            </Box>
                          </Box>
                        </CardActionArea>
                      );
                    })}
                  </Box>
                </Card>
              </CardContent>
            </DashboardCard>
          </Grid>
        </Grid>
      </Container>
  );
};

export default FacultyDashboard;
// client/src/components/SponsorDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Alert,
  Chip,
  formatDate,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField
} from '@mui/material';
import {
  FaPlus,
} from 'react-icons/fa';
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
import StudentSearch from './StudentSearch';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Sponsor', email: 'sponsor@tamu.edu' });
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const [sponsorships, setSponsorships] = useState([]);
  const [sponsorForm, setSponsorForm] = useState(() => ({
    eventTitle: '',
    description: '',
    caseStudy: '',
    benefits: [],
    tier: 'TeraByte' // Default to the lowest tier
  }));

  useEffect(() => {
    if (showSponsorModal) {
      setSponsorForm({
        eventTitle: '',
        description: '',
        caseStudy: 'No case study provided',
        benefits: ['No benefits specified'],
        tier: 'TeraByte' // Reset to default tier
      });
    }
  }, [showSponsorModal]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]); // Fallback to empty array
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };

    fetchEvents();
  }, []);

  const handleRegisterEvent = async (eventId) => {
    try {
      // Replace with your actual API endpoint
      const response = await api.post(`/events/${eventId}/register`, {
        userId: user?.id,
      });
      toast.success('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error(error.response?.data?.message || 'Failed to register for event');
    }
  };
  // Check authentication and fetch data on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = {
          id: localStorage.getItem('userId') || '69323bcb22018d861fa8f85f', // Hardcoded mentor ID
          name: localStorage.getItem('userName') || 'Mike Mentor',
          company: localStorage.getItem('company') || 'Google',
          role: 'Mentor',
          sharedWithSponsors: localStorage.getItem('sharedWithSponsors') === 'true' || false
        };

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

  const renderEvents = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#500000', fontWeight: 600 }}>
          Upcoming Events
        </Typography>

        {loading.events ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.length > 0 ? (
              events.map((event) => (
                <Grid item xs={12} sm={6} lg={4} key={event._id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={formatDate(event.date)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{
                            color: '#500000',
                            borderColor: '#500000',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{
                        color: '#333',
                        fontWeight: 600,
                        minHeight: '64px'
                      }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        <Box component="span" sx={{ fontWeight: 500, color: '#555' }}>Location: </Box>
                        {event.location || 'TBD'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{
                        mb: 3,
                        minHeight: '60px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {event.description || 'No description available.'}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleRegisterEvent(event._id)}
                        sx={{
                          bgcolor: '#500000',
                          '&:hover': {
                            bgcolor: '#3a0000'
                          }
                        }}
                      >
                        Register for Event
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No upcoming events found. Check back later!
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    );
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data first
      try {
        const response = await api.get('/sponsor/registrations', {
          headers: {
            'x-user-id': 'alex-user-123',
            'x-demo-role': 'sponsor'
          }
        });
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
            name: 'Alex Student',
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

  // Render Sponsorship Tab
  const BusinessCaseChallenge = () => {
    const [challengeText, setChallengeText] = useState('');

    const handleChallengeSubmit = async () => {
      try {
        await axios.post('https://ccgroup6.app.n8n.cloud/webhook-test/fcb9fa3e-ca66-4552-997e-b8d209d40dfa', {
          type: 'SPONSORSHIP_SUBMITTED_FRONTEND',
          description: challengeText,
          sponsorId: user?.id,
          sponsorName: user?.name,
          sponsorEmail: user?.email
        });
        console.log('Webhook triggered successfully');
        toast.success('Challenge submitted successfully!');
      } catch (error) {
        console.error('Error submitting challenge:', error);
        toast.error('Failed to submit challenge. Please try again.');
      }
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#500000', fontWeight: 600 }}>
          Business Case Challenge
        </Typography>
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          p: 3
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create a new business case challenge for students to solve.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Enter the challenge details here..."
            value={challengeText}
            onChange={(e) => setChallengeText(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#500000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#500000',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleChallengeSubmit}
              disabled={!challengeText.trim()}
              sx={{
                bgcolor: '#500000',
                '&:hover': {
                  bgcolor: '#3a0000'
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e'
                },
                px: 4,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Submit Challenge
            </Button>
          </Box>
        </Card>
      </Box>
    );
  };

  const renderEventsTab = () => {
    return (
      <Box>
        {loading.events ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading events...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.length > 0 ? (
              events.map((event) => (
                <Grid item xs={12} sm={6} lg={4} key={event._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={formatDate(event.date)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {event.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {event.description?.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleRegisterEvent(event._id)}
                      >
                        Register for Event
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No upcoming events found.</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <>
      <Container maxWidth="sl" sx={{ py: 4 }}>
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

        {/* Student Search */}
        <Box sx={{ mb: 4 }}>
          <StudentSearch />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {/* Upcoming Events - Takes full width on mobile, half on larger screens */}
            <Grid item xs={12} md={6}>
              {renderEvents()}
            </Grid>

            {/* Business Case Challenge - Takes full width on mobile, half on larger screens */}
            <Grid item sx={12} md={4}>
              <BusinessCaseChallenge />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default SponsorDashboard;
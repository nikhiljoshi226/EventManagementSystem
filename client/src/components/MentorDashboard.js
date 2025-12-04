import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaHandshake, 
  FaPlus, 
  FaSearch, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCog, 
  FaShare,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaEnvelope,
  FaLinkedin,
  FaFilePdf
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTheme, useMediaQuery } from '@mui/material';

// Custom styles
const aggieMaroon = '#500000';
const cardStyle = {
  borderLeft: `4px solid ${aggieMaroon}`,
  height: '100%',
  '&:hover': {
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
  }
};

const aggieButtonStyle = {
  backgroundColor: aggieMaroon,
  color: 'white',
  '&:hover': {
    backgroundColor: '#3a0000',
    boxShadow: 'none'
  },
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 24px'
};

const headerStyle = {
  color: aggieMaroon,
  fontWeight: 600,
  marginBottom: '16px'
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { color: 'warning', icon: <FaClock /> },
    Approved: { color: 'success', icon: <FaCheckCircle /> },
    Rejected: { color: 'error', icon: <FaTimesCircle /> },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  
  return (
    <Chip
      icon={config.icon}
      label={status}
      color={config.color}
      variant="outlined"
      size="small"
    />
  );
};

const MentorDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [students, setStudents] = useState([]);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  // User data with hardcoded mentor ID
  const user = {
    id: localStorage.getItem('userId') || '6931278880e061e4215a312e', // Hardcoded mentor ID
    name: localStorage.getItem('userName') || 'Mike Mentor',
    company: localStorage.getItem('company') || 'Google',
    role: 'Mentor',
    sharedWithSponsors: localStorage.getItem('sharedWithSponsors') === 'true' || false
  };
  
  // Form state for sponsorship
  const [sponsorForm, setSponsorForm] = useState(() => ({
    eventTitle: '',
    description: '',
    caseStudy: '',
    benefits: [],
    tier: 'TeraByte' // Default to the lowest tier
  }));
  
  // Reset form when modal opens
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
  
  // Log form state when it changes
  useEffect(() => {
    console.log('Sponsor Form State:', sponsorForm);
  }, [sponsorForm]);
  
  // Loading states
  const [loading, setLoading] = useState({
    events: true,
    registrations: true,
    sponsorships: true,
    students: true
  });
  
  // Error and success states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        console.log('Fetching data...');
        
        // Set all loading states to true initially
        setLoading(prev => ({
          ...prev,
          events: true,
          registrations: true,
          sponsorships: true,
          students: true
        }));

        // Fetch data with individual error handling
        const [eventsRes, registrationsRes, sponsorshipsRes, studentsRes] = await Promise.all([
          api.get('/events').catch(err => {
            console.error('Error fetching events:', err);
            return { data: [] };
          }),
          api.get(`/mentor/registrations?userId=${user.id}`).catch(err => {
            console.error('Error fetching registrations:', err);
            return { data: [] };
          }),
          api.get('/mentor/sponsorships').catch(err => {
            console.error('Error fetching sponsorships:', err);
            return { data: [] };
          }),
          api.get('/users?role=Student').then(res => {
            console.log('Students data:', res.data);
            return { data: res.data };
          }).catch(err => {
            console.error('Error fetching students:', err);
            return { data: [] };
          })
        ]);

        console.log('Fetched data:', {
          events: eventsRes?.data || [],
          registrations: registrationsRes?.data || [],
          sponsorships: sponsorshipsRes?.data || []
        });

        // Update state with fallback to empty arrays if data is undefined
        setEvents(eventsRes?.data || []);
        setRegistrations(registrationsRes?.data || []);
        setSponsorships(sponsorshipsRes?.data || []);
        setStudents(studentsRes?.data || []);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading({
          events: false,
          registrations: false,
          sponsorships: false,
          students: false
        });
      }
    };

    fetchData();
  }, []);

  // Handle sharing profile with sponsors
  const handleShareProfile = async () => {
    try {
      setIsSharing(true);
      const response = await api.post('/mentor/share-details', { mentorId: user.id });
      
      // Update local storage
      localStorage.setItem('sharedWithSponsors', 'true');
      
      setSuccess('Your profile has been shared with sponsors!');
      toast.success('Profile shared successfully with sponsors');
    } catch (error) {
      console.error('Error sharing profile:', error);
      setError('Failed to share profile. Please try again.');
      toast.error('Failed to share profile');
    } finally {
      setIsSharing(false);
    }
  };

  // Handle sponsorship form submission
  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create submission object with all required fields
      const submissionData = {
        mentorId: user.id,
        eventTitle: sponsorForm.eventTitle?.trim() || '',
        description: sponsorForm.description?.trim() || '',
        caseStudy: sponsorForm.caseStudy?.trim() || 'No case study provided',
        benefits: Array.isArray(sponsorForm.benefits) ? sponsorForm.benefits : ['No benefits specified'],
        tier: sponsorForm.tier || 'TeraByte' // Default to TeraByte if not specified
      };
      
      console.log('Submitting sponsorship:', submissionData);
      
      // Validate required fields
      if (!submissionData.eventTitle || !submissionData.description || !submissionData.tier) {
        toast.error('Please fill in all required fields');
        return;
      }
    
      // Submit to your API
      const response = await api.post('/mentor/sponsorship', submissionData);
      
      // Trigger webhook directly from frontend
      try {
        await axios.post('https://ccgroup6.app.n8n.cloud/webhook/fcb9fa3e-ca66-4552-997e-b8d209d40dfa', {
          type: 'SPONSORSHIP_SUBMITTED_FRONTEND',
          mentorId: user.id,
          eventTitle: submissionData.eventTitle,
          caseStudy: submissionData.caseStudy,
          timestamp: new Date().toISOString()
        });
        console.log('Webhook triggered successfully');
      } catch (webhookError) {
        console.error('Webhook error (non-blocking):', webhookError);
        // Don't fail the main request if webhook fails
      }
      
      // Update sponsorships list with the new submission
      setSponsorships(prevSponsorships => [response.data, ...prevSponsorships]);
      
      // Reset form and close modal
      setSponsorForm({ 
        eventTitle: '', 
        description: '', 
        caseStudy: 'No case study provided', 
        benefits: ['No benefits specified']
      });
      setShowSponsorModal(false);
      
      toast.success('Sponsorship request submitted successfully!');
    } catch (error) {
      console.error('Error submitting sponsorship:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit sponsorship request';
      console.error('Server error details:', error.response?.data);
      toast.error(errorMessage);
    }
  };

  // Render Events Tab
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

  // Render Sponsorship Tab
  const renderSponsorshipTab = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Why Sponsor?</Typography>
                <List>
                  {[
                    { text: 'Brand Exposure - Reach top students' },
                    { text: 'Recruitment - Connect with future talent' },
                    { text: 'Networking - Engage with faculty and industry leaders' },
                    { text: 'Innovation - Access fresh perspectives on real challenges' }
                  ].map((item, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 24, mr: 1 }}>
                        <FiberManualRecordIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<FaPlus />}
                  onClick={() => setShowSponsorModal(true)}
                  sx={{ mt: 2 }}
                >
                  Apply To Be a Sponsor
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Your Proposals</Typography>
                {loading.sponsorships ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
                    <CircularProgress color="primary" />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading sponsorships...</Typography>
                  </Box>
                ) : sponsorships.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Event Title</TableCell>
                          <TableCell>Tier</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sponsorships.map((sponsor) => (
                          <TableRow key={sponsor._id} hover>
                            <TableCell>{sponsor.eventTitle}</TableCell>
                            <TableCell>
                              {sponsor.tier} {
                                sponsor.tier === 'ExaByte' ? '($10,000)' ?
                                sponsor.tier === 'PetaByte'  : 'TeraByte' : ''
                              }
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={sponsor.status} 
                                color={
                                  sponsor.status.toLowerCase() === 'approved' ? 'success' : 
                                  sponsor.status.toLowerCase() === 'pending' ? 'warning' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No sponsorship requests found.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Student Details Modal Component
  const StudentDetailsModal = ({ open, onClose, student }) => {
    if (!student) return null;
    
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <FaUserGraduate size={24} />
            <span>Student Profile</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" mb={3}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: 48,
                    margin: '0 auto 16px',
                    bgcolor: 'primary.main'
                  }}
                >
                  {student.name?.charAt(0) || 'S'}
                </Avatar>
                <Typography variant="h6">{student.name}</Typography>
                <Typography color="textSecondary">{student.major || 'Undeclared'}</Typography>
                <Typography color="textSecondary">Class of {student.graduationYear || 'N/A'}</Typography>
                
                <Box mt={2} display="flex" gap={1} justifyContent="center">
                  {student.linkedIn && (
                    <IconButton 
                      href={student.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      <FaLinkedin />
                    </IconButton>
                  )}
                  {student.email && (
                    <IconButton href={`mailto:${student.email}`} color="primary">
                      <FaEnvelope />
                    </IconButton>
                  )}
                  {student.resumeUrl && (
                    <IconButton 
                      href={student.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      <FaFilePdf />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  About
                </Typography>
                <Typography paragraph>
                  {student.bio || 'No bio available.'}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {student.skills?.length > 0 ? (
                      student.skills.map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography color="textSecondary">No skills listed</Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Interests
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {student.interests?.length > 0 ? (
                      student.interests.map((interest, index) => (
                        <Chip 
                          key={index} 
                          label={interest} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography color="textSecondary">No interests listed</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderTalentScoutTab = () => {
    const filteredStudents = students.filter(student => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        student.name?.toLowerCase().includes(query) ||
        student.major?.toLowerCase().includes(query) ||
        student.skills?.some(skill => 
          skill.toLowerCase().includes(query)
        ) ||
        student.interests?.some(interest => 
          interest.toLowerCase().includes(query)
        )
      );
    });

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Student Directory
          </Typography>
          <TextField
            size="small"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>

        {loading.students ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredStudents.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Top Skill</TableCell>
                  <TableCell>Interests</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <Typography fontWeight="medium">{student.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {student.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {student.skills?.length > 0 ? (
                        <Chip 
                          label={student.skills[0]} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.interests?.slice(0, 2).join(', ') || 'N/A'}
                      {student.interests?.length > 2 && '...'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedStudent(student)}
                        startIcon={<FaUserTie />}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FaUserGraduate size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No students found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchQuery 
                ? 'No students match your search. Try a different term.'
                : 'There are currently no students in the system.'}
            </Typography>
          </Box>
        )}

        {/* Student Details Modal */}
        <StudentDetailsModal 
          open={!!selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          student={selectedStudent} 
        />
      </Box>
    );
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle opening student details
  const openStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  // Handle closing student details
  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };

  // Handle event registration
  const handleRegisterEvent = (eventId) => {
    // Implementation for event registration
    console.log('Registering for event:', eventId);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      <Container maxWidth={false} sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold" gutterBottom>
              Welcome back, {user.name.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mentor at {user.company}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              aria-label="mentor dashboard tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <Tab 
                icon={<FaCalendarAlt style={{ marginBottom: 4 }} />}
                iconPosition="start"
                label="Upcoming Events"
                value="events"
                sx={{ minHeight: 64 }}
              />
              <Tab 
                icon={<FaHandshake style={{ marginBottom: 4 }} />}
                iconPosition="start"
                label="Sponsorship"
                value="sponsorship"
                sx={{ minHeight: 64 }}
              />
              <Tab 
                icon={<FaUserGraduate style={{ marginBottom: 4 }} />}
                iconPosition="start"
                label="Talent Scout"
                value="talent"
                sx={{ minHeight: 64 }}
              />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'sponsorship' && renderSponsorshipTab()}
            {activeTab === 'talent' && renderTalentScoutTab()}
          </Box>
        </Paper>

        {/* Modals */}
        <StudentDetailsModal
        student={selectedStudent}
      />
      {/* Sponsorship Request Modal */}
<Modal
  open={showSponsorModal}
  onClose={() => setShowSponsorModal(false)}
  aria-labelledby="sponsor-modal-title"
  aria-describedby="sponsor-modal-description"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: 600 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
    outline: 'none'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography id="sponsor-modal-title" variant="h6" component="h2">
        Submit Sponsorship Request
      </Typography>
      <IconButton 
        onClick={() => setShowSponsorModal(false)}
        sx={{ color: 'text.secondary' }}
      >
        &times;
      </IconButton>
    </Box>
    
    <Box component="form" onSubmit={handleSponsorSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Event Title"
        variant="outlined"
        margin="normal"
        required
        value={sponsorForm.eventTitle}
        onChange={(e) => setSponsorForm({...sponsorForm, eventTitle: e.target.value})}
      />
      
      <TextField
        fullWidth
        label="Description"
        variant="outlined"
        margin="normal"
        required
        value={sponsorForm.description}
        onChange={(e) => setSponsorForm({...sponsorForm, description: e.target.value})}
        placeholder="Brief description of the sponsorship (e.g., Sponsorship for student awards and catering)"
      />
      
      <TextField
        fullWidth
        label="Case Study (Optional)"
        variant="outlined"
        margin="normal"
        multiline
        rows={4}
        value={sponsorForm.caseStudy}
        onChange={(e) => setSponsorForm({...sponsorForm, caseStudy: e.target.value})}
        helperText="Please provide a brief case study or description of the event"
      />
      
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Membership Tier</InputLabel>
        <Select
          value={sponsorForm.tier}
          label="Membership Tier"
          onChange={(e) => setSponsorForm({...sponsorForm, tier: e.target.value})}
        >
          <MenuItem value="ExaByte">ExaByte Members</MenuItem>
          <MenuItem value="PetaByte">PetaByte Members</MenuItem>
          <MenuItem value="TeraByte">TeraByte Members</MenuItem>
        </Select>
        <FormHelperText>Select your desired sponsorship level</FormHelperText>
      </FormControl>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="inherit"
          onClick={() => setShowSponsorModal(false)}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
        >
          Submit Request
        </Button>
      </Box>
    </Box>
  </Box>
</Modal>

{/* Student Details Modal */}
<StudentDetailsModal
  open={!!selectedStudent}
  onClose={closeStudentDetails}
  student={selectedStudent}
/>
    </Container>
    </Box>
  );
};

export default MentorDashboard;

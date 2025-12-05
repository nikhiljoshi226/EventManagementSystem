import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  Upload as UploadIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// n8n webhook URL - replace with your actual n8n webhook URL
const N8N_RESUME_WEBHOOK = 'https://ccgroup6.app.n8n.cloud/webhook-test/upload-resume';

// Styled Components
const MentorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const MatchScoreBadge = styled('div')(({ score }) => {
  let color;
  if (score >= 80) color = '#4caf50'; // Green
  else if (score >= 60) color = '#ff9800'; // Orange
  else color = '#f44336'; // Red
  
  return {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: color,
    color: 'white',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem'
  };
});

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uin, setUin] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmitResume = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    if (!uin) {
      alert('Please enter your UIN');
      return;
    }

    console.log('Preparing to upload file:', selectedFile.name);
    
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('studentName', 'Student User');
    formData.append('uin', uin);
    
    // Log form data entries
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }
    
    setIsUploading(true);
    console.log('Sending request to n8n webhook:', N8N_RESUME_WEBHOOK);

    try {
      // Send to n8n workflow only
      const response = await axios.post(N8N_RESUME_WEBHOOK, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      console.log('n8n webhook response status:', response.status);
      console.log('n8n webhook response data:', response.data);
      
      // Reset form
      setSelectedFile(null);
      setUin('');
      setOpenUploadDialog(false);
      
      alert('Resume uploaded! AI analysis started. You will be notified when matches are ready.');
    } catch (error) {
      console.error('Upload to n8n failed:', error);
      
      let errorMessage = 'Upload failed. Please try again.';
      if (error.response) {
        errorMessage += ` (${error.response.status} ${error.response.statusText})`;
        if (error.response.data?.message) {
          errorMessage += `: ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += ' No response received from server. Please check your connection.';
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessResume = async () => {
    try {
      setIsProcessing(true);
      alert('Please upload a resume first to find matches.');
    } catch (error) {
      console.error('Error processing resume:', error);
      alert('Error processing resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard tab
        return (
          <>
            <Box mb={4}>
              <Typography variant="h4" gutterBottom>
                Find Your Perfect Mentor
              </Typography>
              <Typography color="textSecondary" paragraph>
                Get matched with industry professionals based on your skills and interests
              </Typography>
              
              <Box display="flex" gap={2} mt={3} mb={4} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={() => setOpenUploadDialog(true)}
                >
                  Upload Resume
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleProcessResume}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Finding Matches...' : 'Find Matches'}
                </Button>
              </Box>

              {isProcessing && (
                <Box mb={3}>
                  <LinearProgress />
                  <Typography variant="body2" color="textSecondary" align="center" mt={1}>
                    Analyzing your resume and finding the best mentor matches...
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="300px"
              textAlign="center"
              p={3}
              bgcolor="background.paper"
              borderRadius={1}
              boxShadow={1}
            >
              <SchoolIcon color="action" sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Upload your resume to find matching mentors
              </Typography>
              <Typography variant="body2" color="textSecondary" maxWidth="500px">
                Our AI will analyze your skills and experience to connect you with the most relevant
                industry professionals who can help guide your career.
              </Typography>
            </Box>
          </>
        );
      
      case 1: // Profile tab
        return (
          <Box>
            <Typography variant="h4" gutterBottom>My Profile</Typography>
            
            <Card sx={{ mb: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resume & AI Profile</Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Upload your resume to let our AI match you with the best mentors.
                </Typography>
                
                <Box mt={3}>
                  <input
                    accept=".pdf"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                  </label>
                  
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    Accepted formats: PDF only
                  </Typography>
                  
                  {isUploading && (
                    <Box display="flex" alignItems="center" mt={2}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        Uploading to AI Engine...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="dashboard tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="My Profile" />
        </Tabs>
      </Box>
      
      {renderTabContent()}

      {/* Upload Resume Dialog */}
      <Dialog open={openUploadDialog} onClose={() => !isUploading && setOpenUploadDialog(false)}>
        <DialogTitle>Upload Your Resume</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              required
              id="uin"
              label="University ID (UIN)"
              placeholder="e.g., 123456789"
              value={uin}
              onChange={(e) => setUin(e.target.value)}
              disabled={isUploading}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="subtitle1" gutterBottom>Select your resume file</Typography>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="resume-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <label htmlFor="resume-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={isUploading}
                sx={{ mb: 1 }}
              >
                Select File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
            <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
              Accepted format: PDF only
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitResume}
            disabled={!selectedFile || !uin || isUploading}
            fullWidth
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isUploading ? 'Uploading...' : 'Submit Resume'}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (!isUploading) {
                setSelectedFile(null);
                setOpenUploadDialog(false);
              }
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
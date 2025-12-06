import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Divider,
  useTheme,
  alpha,
  Checkbox,
} from '@mui/material';
import { Search as SearchIcon, School as SchoolIcon, ErrorOutline as ErrorOutlineIcon, Email as EmailIcon } from '@mui/icons-material';

const StudentSearch = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]); // Add this line

  const handleSelectStudent = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s._id === student._id);
      if (isSelected) {
        return prev.filter(s => s._id !== student._id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSendEmail = () => {
    const emails = selectedStudents.map(s => s.emailID).join(';');
    window.location.href = `mailto:${emails}`;
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    const searchQuery = String(query || '').trim();
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('http://localhost:5000/api/student/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process search');
      }

      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message.includes('Failed to fetch')
        ? 'Unable to connect to the server. Please check your connection.'
        : 'An error occurred while searching. Please try again.'
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    return 'secondary';
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const renderStudentsTable = () => {
    if (!searchResults?.similar_students || searchResults.similar_students.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No matching students found
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Try a different search query
          </Typography>
        </Box>
      );
    }

    return (
      <Paper elevation={0} sx={{ overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Match Score
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Select
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchResults.similar_students.map((student, index) => (
                <TableRow
                  key={student._id}
                  hover
                  sx={{
                    bgcolor: index === 0 ? 'primary.50' : 'inherit',
                    '&:hover': {
                      bgcolor: index === 0 ? 'primary.100' : 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {student.studentName || 'N/A'}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="Best Match"
                            size="small"
                            color="primary"
                            sx={{
                              height: 20,
                              mt: 0.5,
                              '& .MuiChip-label': { px: 1, fontSize: '0.7rem' }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.emailID || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {(student.similarity_score * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: '100%',
                        height: 6,
                        bgcolor: 'divider',
                        borderRadius: 3,
                        mt: 0.5,
                        overflow: 'hidden'
                      }}>
                        <Box
                          sx={{
                            height: '100%',
                            bgcolor: 'primary.main',
                            width: `${student.similarity_score * 100}%`,
                            borderRadius: 3
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={handleSendEmail}
                      startIcon={<EmailIcon />}
                      sx={{
                        bgcolor: '#500000',
                        '&:hover': {
                          bgcolor: '#3a0000'
                        }
                      }}
                    >
                      Send Email
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        mb: 4,
        border: '1px solid',
        borderColor: 'divider',
        maxWidth: '100%',
        mx: 'auto'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Search Header */}
        <Box sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(80, 0, 0, 0.02)'
        }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: '#500000', // TAMU Maroon
              fontFamily: '"Helvetica Neue", Arial, sans-serif'
            }}
          >
            Student Talent Scout
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: 'text.secondary',
              maxWidth: '800px'
            }}
          >
            Discover talented students by searching with natural language. Find the perfect match for your projects and teams.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              maxWidth: '1000px',
              mx: 'auto'
            }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'stretch'
            }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Try: 'Computer Science students with React experience' or 'Mobile app developers'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <SearchIcon sx={{ color: '#500000' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    p: 1.5,
                    border: '1px solid #e0e0e0',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(80, 0, 0, 0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(80, 0, 0, 0.2)',
                      borderColor: '#500000'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                size="large"
                sx={{
                  minWidth: '180px',
                  height: 'auto',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1.5,
                  bgcolor: '#500000',
                  '&:hover': {
                    bgcolor: '#3a0000',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(80, 0, 0, 0.4)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Search Students'
                )}
              </Button>
            </Box>

            <Box sx={{
              mt: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center'
            }}>
              <Chip
                label="Web Development"
                variant="outlined"
                size="small"
                onClick={() => setQuery("Web Development")}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#500000',
                    color: '#500000'
                  }
                }}
              />
              <Chip
                label="Data Science"
                variant="outlined"
                size="small"
                onClick={() => setQuery("Data Science")}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#500000',
                    color: '#500000'
                  }
                }}
              />
              <Chip
                label="UI/UX Design"
                variant="outlined"
                size="small"
                onClick={() => setQuery("UI/UX Design")}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#500000',
                    color: '#500000'
                  }
                }}
              />
            </Box>

            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: 'error.light',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <ErrorOutlineIcon fontSize="small" />
                {error}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Results Section */}
        {hasSearched && (
          <Box sx={{ p: 0, bgcolor: 'background.paper' }}>
            {isLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ color: theme.palette.primary.main, mb: 2 }} />
                <Typography>Searching for students...</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {searchResults.length} {searchResults.length === 1 ? 'Student' : 'Students'} Found
                  </Typography>
                  {searchResults.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Sorted by relevance
                    </Typography>
                  )}
                </Box>
                {renderStudentsTable()}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSearch;
import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Profile = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'danger', text: 'Please select a file to upload' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      
      const response = await axios.post('http://127.0.0.1:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({
        type: 'success',
        text: 'Resume uploaded successfully!',
      });
      
      // Reset file input
      setFile(null);
      document.getElementById('resume-upload').value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Error uploading file. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="card-aggie">
      <Card.Header>Resume Upload</Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
            {message.text}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="resume-upload" className="form-label">
              Upload your resume (PDF or Word)
            </label>
            <input
              className="form-control"
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <div className="form-text">
              Max file size: 5MB. Allowed formats: .pdf, .doc, .docx
            </div>
          </div>
          
          <Button
            variant="primary"
            type="submit"
            disabled={!file || uploading}
            className="btn-aggie"
          >
            {uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              'Upload Resume'
            )}
          </Button>
        </form>
      </Card.Body>
    </Card>
  );
};

export default Profile;

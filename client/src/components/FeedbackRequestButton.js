import React, { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const FeedbackRequestButton = ({ eventId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRequestFeedback = async () => {
    if (window.confirm('Send feedback requests to all attendees?')) {
      setLoading(true);
      setResult(null);
      
      try {
        const response = await axios.post(`http://localhost:5000/api/feedback/request/${eventId}`);
        setResult({
          success: true,
          message: `Feedback requests sent to ${response.data.count} attendees`
        });
        if (onSuccess) onSuccess();
      } catch (error) {
        setResult({
          success: false,
          message: error.response?.data?.message || 'Failed to send feedback requests'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="outline-info"
        size="sm"
        onClick={handleRequestFeedback}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Sending...
          </>
        ) : (
          'Request Feedback'
        )}
      </Button>
      
      {result && (
        <Alert 
          variant={result.success ? 'success' : 'danger'} 
          className="mt-2 mb-0"
          onClose={() => setResult(null)}
          dismissible
        >
          {result.message}
        </Alert>
      )}
    </div>
  );
};

export default FeedbackRequestButton;
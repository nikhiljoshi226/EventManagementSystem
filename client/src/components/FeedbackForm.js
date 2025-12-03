import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Star, StarFill } from 'react-bootstrap-icons';

const FeedbackForm = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    eventId: '',
    rating: 0,
    comments: '',
    hover: 0
  });

  // Fetch user's registered events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/events/registrations/${userId}`);
        setEvents(response.data.map(reg => reg.event));
      } catch (err) {
        setError('Failed to load your events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/feedback/submit', {
        ...formData,
        userId
      });

      setSuccess('Thank you for your feedback!');
      setFormData(prev => ({
        ...prev,
        rating: 0,
        comments: '',
        hover: 0
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>Submit Event Feedback</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Event</Form.Label>
            <Form.Select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              required
              disabled={submitting}
            >
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title} ({new Date(event.date).toLocaleDateString()})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Rating</Form.Label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="star"
                  onMouseEnter={() => setFormData({ ...formData, hover: star })}
                  onMouseLeave={() => setFormData({ ...formData, hover: 0 })}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                >
                  {star <= (formData.hover || formData.rating) ? (
                    <StarFill className="text-warning" />
                  ) : (
                    <Star className="text-secondary" />
                  )}
                </span>
              ))}
              <Form.Control
                type="hidden"
                value={formData.rating}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Share your experience (optional)"
              disabled={submitting}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={submitting || !formData.eventId || !formData.rating}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FeedbackForm;
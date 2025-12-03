import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Table, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import axios from 'axios';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/api/events');
      setEvents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingEvent) {
        // Update existing event
        await axios.put(`http://127.0.0.1:5000/api/events/${editingEvent._id}`, formData);
      } else {
        // Create new event
        await axios.post('http://127.0.0.1:5000/api/events', formData);
      }
      
      // Refresh events and reset form
      await fetchEvents();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Error saving event');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : ''
    });
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      date: ''
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Event Management</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          className="btn-aggie"
        >
          + Create New Event
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="card-aggie">
        <Card.Header>Upcoming Events</Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No events found. Create your first event!
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="table-aggie">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="fw-bold">{event.title}</div>
                        <small className="text-muted">
                          {event.description?.substring(0, 50)}
                          {event.description?.length > 50 ? '...' : ''}
                        </small>
                      </td>
                      <td>
                        {event.date 
                          ? format(new Date(event.date), 'MMM d, yyyy h:mm a')
                          : 'TBD'}
                      </td>
                      <td>{event.location || 'TBD'}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Event Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Event Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date & Time *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location *</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter event location"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting} className="btn-aggie">
              {submitting ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : editingEvent ? (
                'Update Event'
              ) : (
                'Create Event'
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

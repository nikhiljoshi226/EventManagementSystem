// client/src/components/AnalyticsWidget.js
import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const AnalyticsWidget = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/analytics/student-interests');
        setInterests(response.data.data || []);
      } catch (err) {
        console.error('Error fetching interests:', err);
        setError('Failed to load student interests');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="my-3">{error}</Alert>;
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Top Student Interests</Card.Header>
      <Card.Body>
        {interests.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {interests.slice(0, 10).map((item, index) => (
              <Badge 
                key={index} 
                bg={index < 3 ? 'primary' : 'secondary'} 
                className="fs-6 p-2 mb-2"
              >
                {item.interest} <Badge bg="light" text="dark">{item.count}</Badge>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted">No interest data available</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default AnalyticsWidget;
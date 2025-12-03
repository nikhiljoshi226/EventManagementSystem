// client/src/components/Events.js
import React from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const Events = () => {
  // This is a placeholder - you'll want to fetch events from your API
  const events = [
    { id: 1, title: 'Data Analytics Summit', date: '2024-03-15', location: 'CMIS Main Auditorium' },
    { id: 2, title: 'Energy Future Panel', date: '2024-04-10', location: 'CMIS Business Hall' }
  ];

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Upcoming Events
      </Typography>
      <List>
        {events.map((event) => (
          <ListItem key={event.id} divider>
            <ListItemText
              primary={event.title}
              secondary={`${event.date} - ${event.location}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Events;
import React, { useEffect } from 'react';
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Badge,
  ListGroup
} from 'react-bootstrap';
import { 
  FaLinkedin, 
  FaEnvelope, 
  FaFilePdf, 
  FaGraduationCap, 
  FaTools, 
  FaUser, 
  FaBriefcase, 
  FaMapMarkerAlt
} from 'react-icons/fa';

const StudentDetailsModal = ({ show, onHide, student }) => {
  if (!student) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="student-details-modal">
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <div className="w-100">
          <div className="d-flex align-items-start">
            {/* Profile Picture */}
            <div className="me-4">
              <div className="rounded-circle bg-light" style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                {student.profileImage ? (
                  <img 
                    src={student.profileImage} 
                    alt={student.name} 
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary text-white">
                    <FaUser size={40} />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow-1">
              <h3 className="mb-1 text-tamu-maroon fw-bold">{student.name}</h3>
              <p className="text-muted mb-2">{student.major}</p>
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="light" text="dark" className="border">
                  <FaGraduationCap className="me-1" /> Class of {student.graduationYear || 'N/A'}
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  <FaMapMarkerAlt className="me-1" /> {student.location || 'Texas A&M University'}
                </Badge>
              </div>

              {/* Social Links */}
              <div className="d-flex gap-2">
                {student.linkedIn && (
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="rounded-circle p-2"
                    href={student.linkedIn.startsWith('http') ? student.linkedIn : `https://${student.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <FaLinkedin />
                  </Button>
                )}
                {student.email && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="rounded-circle p-2"
                    href={`mailto:${student.email}`}
                    title="Email"
                  >
                    <FaEnvelope />
                  </Button>
                )}
                {student.resumeUrl && (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="rounded-circle p-2"
                    href={student.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Resume"
                  >
                    <FaFilePdf />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <Row className="g-4">
          {/* About Section */}
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="card-title text-tamu-maroon">
                  <FaUser className="me-2" /> About Me
                </h5>
                <p className="card-text">
                  {student.about || 'No information provided.'}
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Education Section */}
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="card-title text-tamu-maroon">
                  <FaGraduationCap className="me-2" /> Education
                </h5>
                {student.education ? (
                  <div>
                    <h6 className="mb-1">{student.education.degree}</h6>
                    <p className="mb-1 text-muted">{student.education.institution}</p>
                    <small className="text-muted">
                      {student.education.startYear} - {student.education.endYear || 'Present'}
                    </small>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No education information available</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Experience Section */}
          <Col xs={12} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="card-title text-tamu-maroon">
                  <FaBriefcase className="me-2" /> Experience
                </h5>
                {student.experience?.length > 0 ? (
                  student.experience.map((exp, index) => (
                    <div key={index} className={index > 0 ? 'mt-3' : ''}>
                      <h6 className="mb-1">{exp.title}</h6>
                      <p className="mb-1 text-muted">{exp.company}</p>
                      <small className="text-muted">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No experience listed</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Skills Section */}
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="card-title text-tamu-maroon mb-3">
                  <FaTools className="me-2" /> Skills
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {student.skills?.length > 0 ? (
                    student.skills.map((skill, index) => (
                      <Badge key={index} bg="light" text="dark" className="px-3 py-2 border">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No skills listed</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentDetailsModal;

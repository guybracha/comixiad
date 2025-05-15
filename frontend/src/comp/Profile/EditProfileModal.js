import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const EditProfileModal = ({
  show,
  onHide,
  onSubmit,
  formData,
  onChange,
  onFileChange,
  successMessage,
  errorMessage
}) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Edit Profile</Modal.Title>
    </Modal.Header>
    <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="formUsername" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formBio" className="mb-3">
          <Form.Label>Bio</Form.Label>
          <Form.Control
            as="textarea"
            name="bio"
            rows={3}
            value={formData.bio || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formLocation" className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formGenres" className="mb-3">
          <Form.Label>Favorite Genres (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            name="favoriteGenres"
            value={Array.isArray(formData.favoriteGenres) ? formData.favoriteGenres.join(', ') : formData.favoriteGenres || ''}
            onChange={onChange}
          />
        </Form.Group>

        <hr />

        <Form.Group controlId="formTwitter" className="mb-3">
          <Form.Label>Twitter</Form.Label>
          <Form.Control
            type="text"
            name="socialLinks.twitter"
            value={formData.socialLinks?.twitter || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formInstagram" className="mb-3">
          <Form.Label>Instagram</Form.Label>
          <Form.Control
            type="text"
            name="socialLinks.instagram"
            value={formData.socialLinks?.instagram || ''}
            onChange={onChange}
          />
        </Form.Group>

        <Form.Group controlId="formDeviantArt" className="mb-3">
          <Form.Label>DeviantArt</Form.Label>
          <Form.Control
            type="text"
            name="socialLinks.deviantart"
            value={formData.socialLinks?.deviantart || ''}
            onChange={onChange}
          />
        </Form.Group>

        <hr />

        <Form.Group controlId="formAvatar" className="mb-3">
          <Form.Label>Avatar</Form.Label>
          <Form.Control
            type="file"
            name="avatar"
            onChange={onFileChange}
          />
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>
);

export default EditProfileModal;

import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const EditProfileModal = ({ show, onHide, onSubmit, formData, onChange, onFileChange }) => (
    <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
            <Form onSubmit={onSubmit}>
                <Form.Group controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={onChange}
                    />
                </Form.Group>
                {/* Add other fields like email, bio, social links, etc. */}
                <Form.Group controlId="formAvatar">
                    <Form.Label>Avatar</Form.Label>
                    <Form.Control type="file" name="avatar" onChange={onFileChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Save Changes
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
);

export default EditProfileModal;

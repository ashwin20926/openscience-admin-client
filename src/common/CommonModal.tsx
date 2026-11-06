import { Modal, Button } from "react-bootstrap";

interface CommonModalProps {
  show: boolean;
  title: string;
  body: React.ReactNode;
  confirmButonText?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  size?: 'sm' | 'lg' | 'xl';
  backdrop?: 'static' | boolean;
}

const CommonModal = ({ show, title, body, onClose, onConfirm, loading, size, backdrop = true, confirmButonText = "Save" }: CommonModalProps) => (
  <Modal show={show} onHide={onClose} size={size} backdrop={backdrop}>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onConfirm} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Saving...
          </>
        ) : confirmButonText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default CommonModal;

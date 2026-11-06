import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthContext';
import CommonModal from "../common/CommonModal";
import CreateUserForm from "../views/forms/CreateUserForm";
import { useRef, useState } from 'react';

function NavBar() {
  const auth = useAuthContext();
  const logout = auth?.logout;
  const navigate = useNavigate();
  const user = auth?.user;
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  function logOut(): void {
    if (logout) logout();
    navigate('/login');
  }

  function profile(): void {
    setShowModal(true);
  }
  
  const handleLoading = (value: any) => {
    setLoading(value)
  }

  const handleFormSubmit = () => {
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  
  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <nav className="navbar navbar-expand-lg" data-bs-theme="dark">
      <a className="navbar-brand" href="#">Open Science Publications</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 navbar-right">
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {user?.name} ({user?.roleName})
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" onClick={() => profile()}>Profile</a></li>
              <li><a className="dropdown-item" onClick={() => logOut()}>log out</a></li>                  
            </ul>
          </li>
        </ul>
      </div>

      <CommonModal
        show={showModal}
        title="Create user"
        body={<CreateUserForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={{id: user?.id, name: user?.name, email: user?.email}} />}
        onClose={handleClose}
        loading={loading}
        onConfirm={handleConfirm}
      />

    </nav>
  );
}

export default NavBar;

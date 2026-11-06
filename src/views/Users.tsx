import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";
import CommonModal from "../common/CommonModal";
import CreateUserForm from "./forms/CreateUserForm";

const Users = () => {
  const [data, setMainCategories] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [columnDefs] = useState([
    { headerName: "Name", field: "name" },
    { headerName: "Email", field: "email" },
    { 
      headerName: "Status", 
      field: "status",
      valueFormatter: (params: any) => {
        return params.value === 1 ? "Active" : params.value === 2 ? "Inactive" : "Unknown";
      }
    },
    { headerName: "Role", field: "roleName" },
    { headerName: "Created Date", field: "created_on" },
  ]);

  const handleOpen = () => {
    setUserData(null); // Clear previous data when creating new user
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const fetchUsers = async () => {
    setLoadingState(true);
    const response = await axiosInstance.get(`users`);

    setMainCategories(response.data.users);
    setLoadingState(false);
    handleClose();
  };

  const handleLoading = (value: any) => {
    setLoading(value)
  }

  const handleEdit = (userData: any) => {
    // Load user data into modal for editing
    setShowModal(true);
    setUserData(userData);
  };

  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };

  const getTitle = () => {
    return userData?.id ? "Edit user" : "Create user";
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
      </div>
      <div className="create-btn">
        <input
          type="text"
          name="avens-grid-search"
          className="avens-grid-search form-control"
          placeholder="Search"
          onKeyUp={onFilterTextBoxChanged}
        />
        <button className="btn btn-primary" onClick={handleOpen}>
          Create user
        </button>
      </div>
      <CommonModal
        show={showModal}
        title={getTitle()}
        body={<CreateUserForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
        onClose={handleClose}
        loading={loading}
        onConfirm={handleConfirm}
      />
      <div className="table-data">
        <CustomAgGrid
          loadingState={loadingState}
          searchData={searchData}
          columnDefs={columnDefs}
          rowData={data}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default Users;

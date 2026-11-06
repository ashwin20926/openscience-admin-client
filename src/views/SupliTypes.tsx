import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";
import CommonModal from "../common/CommonModal";
import CreateSupliForm from './forms/CreateSupliTypeForm';
import { useConfirmDelete } from '../common/ConfirmDeleteContext';

const SupliTypes = () => {
  const [data, setSupliTypes] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);

  const confirmDelete = useConfirmDelete();

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    fetchSupliTypes();
  };

  useEffect(() => {
    fetchSupliTypes();
  }, []);

  const [columnDefs] = useState([
    { headerName: "Supli Name", field: "supli_name" },
    { headerName: "Journal Id", field: "journal_id" },
    { headerName: "Created Date", field: "created_date" },
    { headerName: "Updated Date", field: "updated_date" },
  ]);

  const handleOpen = () => {
    setShowModal(true);
    setUserData(null);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleEdit = (userData: any) => {
    handleOpen();
    setUserData(userData);
    setShowModal(true);
  };

  const handleDelete = (supli: any) => {
    confirmDelete({
      title: 'Delete Latest supli',
      body: (
        <span>
          Are you sure you want to delete <strong>{supli?.supli_name}</strong>?
        </span>
      ),
      onDeleteAction: async () => {
        if (!supli?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteSupliType/${supli.id}`);
          await fetchSupliTypes();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };
  const fetchSupliTypes = async () => {
    setLoadingState(true);
    const response = await axiosInstance.get(`getSupliTypes`);
    //console.log(response.data)
    setSupliTypes(response.data.data);
    setLoadingState(false);
    setUserData(null);
    handleClose();
  };

  const handleLoading = (value: any) => {
    setLoading(value)
  }

  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Supli Types</h1>
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
          Create Supli Type
        </button>
      </div>
      <CommonModal
        show={showModal}
        title="Create Supli Type"
        body={<CreateSupliForm userData={userData} ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} />}
        onClose={handleClose}
        loading={loading}
        onConfirm={handleConfirm}
        size="lg"
      />
      <div className="table-data">
        <CustomAgGrid
          loadingState={loadingState}
          searchData={searchData}
          columnDefs={columnDefs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowData={data}
          enableDelete={true}
        />
      </div>
    </div>
  );
};

export default SupliTypes;

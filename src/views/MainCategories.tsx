import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";
import CommonModal from "../common/CommonModal";
import CreateCategoryForm from "./forms/CreateCategoryForm";

const MainCategories = () => {
  const [data, setMainCategories] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [columnDefs] = useState([
    { headerName: "Category Name", field: "category_name" },
    { headerName: "Created Date", field: "created_date" },
    { headerName: "Updated Date", field: "updated_date" },
  ]);

  const handleOpen = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const fetchCategories = async () => {
    setLoadingState(true);
    const response = await axiosInstance.post(`getMainCategories`, {
      search_text: "",
    });

    setMainCategories(response.data.data);
    setLoadingState(false);
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
        <h1>Main Categories</h1>
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
          Create Main Category
        </button>
      </div>
      <CommonModal
        show={showModal}
        title="Create Main Category"
        body={<CreateCategoryForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} />}
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
        />
      </div>
    </div>
  );
};

export default MainCategories;

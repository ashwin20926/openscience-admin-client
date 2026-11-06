import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import { useConfirmDelete } from '../common/ConfirmDeleteContext';
import CreateTestimonialsForm from './forms/CreateTestimonialsForm';

const Testimonials = () => {
  const [searchData, setSearchData] = useState("");
  const [fulltextData, setFullTextData] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const pageSize = 15;

  const confirmDelete = useConfirmDelete();

  const deleteRow = (article: any) => {
    console.log(article);
    confirmDelete({
      title: 'Delete Testimonial',
      body: (
        <span>
          Are you sure you want to delete <strong>{article?.user_name} Testimonial</strong>?
        </span>
      ),
      onDeleteAction: async () => {
        if (!article?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteTestimonial/${article.id}`);
          await fetchTestimonials();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoadingState(true);

    try {
      const response = await axiosInstance.get('getTestimonials');
      console.log(response)
      const data = response?.data?.users || [];
      const count = response?.data?.totalCount || data.length;
      setFullTextData(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to fetch full text articles', error);
    } finally {
      setLoadingState(false);
    }
  };

  const handleEdit = (userData: any) => {
    handleOpen();
    setUserData(userData);
    setShowModal(true);
  };

  const [columnDefs] = useState([
    { headerName: "User Name", field: "user_name", width: 300, wrapText: true, autoHeight: true },
    { headerName: "Description", field: "testimonial_desc", width: 200 },
    { headerName: "User Image", field: "user_img", width: 200, autoHeight: true, cellRenderer:  (params: any) => {
      return <img src={`https://www.avensonline.org/wp-content/uploads/${params.value}`}  alt="User Image" />
    } },
    { headerName: "User university", field: "user_university", width: 250 },
    { headerName: "User Designation", field: "user_desig", width: 250 },
    { headerName: "Created Date", field: "created_date", width: 200 },

  ]);
  const [totalCount, setTotalCount] = useState(0);

  const getTitle = () => {
    return userData?.ID ? "Edit Testimonial" : "Create Testimonial";
  }

  const handleLoading = (value: any) => {
    setLoading(value)
  }

  const handleOpen = () => {
    setUserData(null); // Clear previous data when creating new user
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  
  const handleFormSubmit = async () => {
    setShowModal(false);
    await fetchTestimonials();
  };

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  
  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };

  return (
    <>
      <div className="page">
        <div className="page-header">
          <h1>Testimonials</h1>
        </div>
        <div className="search-input">
          <input
            type="text"
            name="avens-grid-search"
            className="avens-grid-search form-control"
            placeholder="Search"
            onKeyUp={onFilterTextBoxChanged}
          />
        </div>
        <div className="create-btn">
        <button className="btn btn-primary" onClick={handleOpen}>
          Create Testimonial
        </button>
      </div>
      </div>
      <div className="page-content">
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateTestimonialsForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
            onClose={handleClose}
            loading={loading}
            onConfirm={handleConfirm}
            backdrop="static"
          />
         <div className="container">
            <div className="table-data">
              <CustomAgGrid
                loadingState={loadingState}
                columnDefs={columnDefs}
                searchData={searchData}
                rowData={fulltextData}
                enableDelete={true}
                onEdit={handleEdit}
                pagination={true}
                paginationPageSize={pageSize}
                totalCount={totalCount}
                onDelete={deleteRow}
                autoHeight={true}
              />
            </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;

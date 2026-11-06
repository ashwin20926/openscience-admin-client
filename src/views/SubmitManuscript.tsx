import { useRef, useState, useEffect } from "react";
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";
import CommonModal from "../common/CommonModal";
import CreateUserForm from "./forms/CreateUserForm";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';
import ReadStatusButtonRenderer from '../common/ReadStatusButtonRenderer';
import { fetchUnreadEnquiryCounts } from '../store/enquiryCountsSlice';
import { useAppDispatch } from '../store/hooks';

const SubmitManuscript = () => {
  const dispatch = useAppDispatch();
  const [data, setMainCategories] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData] = useState<any | null>(null);
  const confirmDelete = useConfirmDelete();

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    fetchSubmitManuscript();
  };

  useEffect(() => {
    fetchSubmitManuscript();
  }, []);

  const updateReadStatus = async (rowData: any, newStatus: number) => {
    if (!rowData?.ID) return;

    try {
      setLoadingState(true);
      await axiosInstance.put(`/updateSubmitManuscriptStatus/${rowData.ID}`, {
        read_status: newStatus,
      });
      await dispatch(fetchUnreadEnquiryCounts());
      await fetchSubmitManuscript();
    } catch (error) {
      console.error("Failed to update read status", error);
    } finally {
      setLoadingState(false);
    }
  };

  const deleteRow = (enquiry: any) => {
    confirmDelete({
      title: 'Delete FullText article',
      body: (
        <span>
          Are you sure you want to delete this enquiry?
        </span>
      ),
      onDeleteAction: async () => {
        if (!enquiry?.ID) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteSubmitManuscript/${enquiry.ID}`);
          await fetchSubmitManuscript();
        } catch (error) {
          console.error("Failed to delete manuscript", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };

  const [columnDefs] = useState([
    {
      headerName: "Created Date",
      field: "created_date",
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return "";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
      },
    },
    { headerName: "First Name", field: "firstname" },
    { headerName: "Email", field: "email" },
    { headerName: "Alternate Email", field: "alter_email" },
    {
      headerName: "Read Status",
      field: "read_status",
      cellRenderer: ReadStatusButtonRenderer,
      cellRendererParams: {
        onUpdate: updateReadStatus,
      },
      valueGetter: (params: any) => params.data?.read_status,
    },
    { headerName: "Journal", field: "journal" },
    { headerName: "Article", field: "article" },
    { headerName: "Country", field: "country" },
    {
      headerName: "Uploaded File",
      field: "uploadfile",
      width: 400,
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) {
          return null;
        }
        return (
          <a
            href={`https://avensonline.org/public/images/${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        );
      },
    },
  ]);

  const handleClose = () => {
    setShowModal(false);
  };

  const fetchSubmitManuscript = async () => {
    setLoadingState(true);
    const response = await axiosInstance.get(`getSubmitManuscripts`);

    setMainCategories(response.data.data);
    setLoadingState(false);
    handleClose();
  };

  const handleLoading = (value: any) => {
    setLoading(value);
  };

  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };

  const getTitle = () => {
    return userData?.id ? "Edit user" : "Create user";
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Submit Manuscript</h1>
      </div>
      <div className="create-btn">
        <input
          type="text"
          name="avens-grid-search"
          className="avens-grid-search form-control"
          placeholder="Search"
          onKeyUp={onFilterTextBoxChanged}
        />
      </div>
      <CommonModal
        show={showModal}
        title={getTitle()}
        body={
          <CreateUserForm
            ref={formRef}
            getLoading={handleLoading}
            onConfirm={handleFormSubmit}
            userData={userData}
          />
        }
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
          noActionColumn={true}
          enableDelete={true}
          onDelete={deleteRow}
        />
      </div>
    </div>
  );
};

export default SubmitManuscript;

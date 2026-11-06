import { useState, useEffect } from "react";
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';
import ReadStatusButtonRenderer from '../common/ReadStatusButtonRenderer';
import { fetchUnreadEnquiryCounts } from '../store/enquiryCountsSlice';
import { useAppDispatch } from '../store/hooks';


const ContactEnquiries = () => {
  const dispatch = useAppDispatch();
  const [data, setContactEnquiries] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const confirmDelete = useConfirmDelete();

  useEffect(() => {
    fetchContactEnquiries();
  }, []);

  const updateReadStatus = async (rowData: any, newStatus: number) => {
    if (!rowData?.id) return;

    try {
      setLoadingState(true);
      await axiosInstance.put(`/updateContactEnquiryStatus/${rowData.id}`, {
        read_status: newStatus,
      });
      await dispatch(fetchUnreadEnquiryCounts());
      await fetchContactEnquiries();
    } catch (error) {
      console.error('Failed to update contact enquiry read status', error);
    } finally {
      setLoadingState(false);
    }
  };

  const deleteRow = (rowData: any) => {
    confirmDelete({
      title: 'Delete FullText article',
      body: (
        <span>
          Are you sure you want to delete this Contact Enquiry?
        </span>
      ),
      onDeleteAction: async () => {
        if (!rowData?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteContactEnquiry/${rowData.id}`);
          await fetchContactEnquiries();
        } catch (error) {
          console.error("Failed to delete contact enquiry", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };


  const [columnDefs] = useState([
    {
      headerName: "Name",
      field: "name"
    },
    { headerName: "Email", field: "email" },
    { headerName: "Phone No", field: "phone_no" },
    {
      headerName: 'Read Status',
      field: 'read_status',
      cellRenderer: ReadStatusButtonRenderer,
      cellRendererParams: { onUpdate: updateReadStatus },
    },
    { headerName: "Message", field: "message" },
    { headerName: "Created Date", field: "created_date" }
  ]);


  const fetchContactEnquiries = async () => {
    setLoadingState(true);
    const response = await axiosInstance.get(`getContactEnquiries`);

    setContactEnquiries(response.data.data);
    setLoadingState(false);
  };

  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };


  return (
    <div className="page">
      <div className="page-header">
        <h1>Contact Enquiries</h1>
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

export default ContactEnquiries;

import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import { useConfirmDelete } from '../common/ConfirmDeleteContext';
import CreateJournalForm from './forms/CreateJournalForm';

const Journals = () => {
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
    confirmDelete({
      title: 'Delete Latest article',
      body: (
        <span>
          Are you sure you want to delete <strong>{article?.article_name}</strong>?
        </span>
      ),
      onDeleteAction: async () => {
        if (!article?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteLatestArticle/${article.id}`);
          await fetchJournals();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setLoadingState(true);

    try {
      const response = await axiosInstance.get('getJournalsFullData');
      const data = response?.data?.data || [];
      const count = response?.data?.totalCount || data.length;
      setFullTextData(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to fetch journals', error);
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
    { headerName: "Journal Name", field: "journal_name", width: 350 },
    { headerName: "ISSN Number", field: "issn_number", width: 250 },
    { headerName: "Created Date", field: "created_date", width: 200 },

  ]);
  const [totalCount, setTotalCount] = useState(0);

  const getTitle = () => {
    return userData?.ID ? "Edit Journal" : "Create Journal";
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
    await fetchJournals();
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
          <h1>Journals</h1>
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
          Create Journal
        </button>
      </div>
      </div>
      <div className="page-content">
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateJournalForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
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
                enableDelete={false}
                onEdit={handleEdit}
                pagination={true}
                paginationPageSize={pageSize}
                totalCount={totalCount}
                onDelete={deleteRow}
              />
            </div>
        </div>
      </div>
    </>
  );
};

export default Journals;

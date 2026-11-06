import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import CreateFullTextForm from "./forms/CreateFullTextForm";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';

const Archives = () => {
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
      title: 'Delete FullText article',
      body: (
        <span>
          Are you sure you want to delete <strong>{article?.post_title}</strong>?
        </span>
      ),
      onDeleteAction: async () => {
        if (!article?.ID) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteFullTextArticle/${article.ID}`);
          await fetchFullTextArticles();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchFullTextArticles();
  }, []);

  const fetchFullTextArticles = async () => {
    setLoadingState(true);

    try {
      const response = await axiosInstance.get('getFullTextArticles');
      const data = response?.data?.data || [];
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
    { headerName: "Post Title", field: "post_title", width: 200 },
    { headerName: "Post Browser Title", field: "post_browser_title", width: 500 },
    { headerName: "Post Date", field: "post_date", width: 200 },
  ]);
  const [totalCount, setTotalCount] = useState(0);

  const getTitle = () => {
    return userData?.ID ? "Edit Fulltext Article" : "Create Fulltext Article";
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
    await fetchFullTextArticles();
  };

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  
  const onFilterTextBoxChanged = async (event: any) => {
    setSearchData(event.target.value);
  };

  // const deleteRow = async (rowData: any) => {
  //   if (!rowData?.ID) return;
  //   try {
  //     setLoadingState(true);
  //     await axiosInstance.delete(`/deleteFullTextArticle/${rowData.ID}`);
  //     await fetchFullTextArticles();
  //   } catch (error) {
  //     console.error("Failed to delete collaboration", error);
  //   } finally {
  //     setLoadingState(false);
  //   }
  // };

  return (
    <>
      <div className="page">
        <div className="page-header">
          <h1>FullText Article</h1>
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
          Create Fulltext Article
        </button>
      </div>
      </div>
      <div className="page-content">
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateFullTextForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
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
              />
            </div>
        </div>
      </div>
    </>
  );
};

export default Archives;

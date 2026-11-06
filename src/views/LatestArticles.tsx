import { useRef, useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import { useConfirmDelete } from '../common/ConfirmDeleteContext';
import CreateLatestArticleForm from './forms/CreateLatestArticleForm';

const LatestArticles = () => {
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
          await fetchLatestArticles();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    setLoadingState(true);

    try {
      const response = await axiosInstance.get('getLatestArticles');
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
    { headerName: "Article Name", field: "article_name", width: 300, wrapText: true, autoHeight: true },
    { headerName: "Pdf Link", field: "pdf_link", width: 200 },
    { headerName: "Journal Name", field: "journal_name", width: 250 },
    { headerName: "Article Image", field: "article_image", width: 200, cellRenderer:  (params: any) => {
      return <img src={`https://www.avensonline.org/wp-content/uploads/${params.value}`}  alt="Article Image" />
    } },
    { headerName: "Author Name", field: "author_name", width: 200 },
    { headerName: "Created Date", field: "created_date", width: 200 },

  ]);
  const [totalCount, setTotalCount] = useState(0);

  const getTitle = () => {
    return userData?.ID ? "Edit Latest Article" : "Create Latest Article";
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
    await fetchLatestArticles();
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
          <h1>Latest Articles</h1>
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
          Create Latest Article
        </button>
      </div>
      </div>
      <div className="page-content">
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateLatestArticleForm ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
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

export default LatestArticles;

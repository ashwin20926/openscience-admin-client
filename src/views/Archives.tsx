import { useEffect, useRef, useState } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import CreateJournalArchive from "./forms/CreateJournalArchive";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';

interface JournalOption {
  id: number;
  journal_name: string;
}

interface ArchiveOption {
  id: number;
  name: string;
}

const archiveTypes: ArchiveOption[] = [
  { id: 1, name: 'Article In Press' },
  { id: 2, name: 'Current Issue' },
  { id: 3, name: 'Archive' },
  { id: 4, name: 'Special Issue' },
];

const articleTypes: ArchiveOption[] = [
  { id: 1, name: 'Review Article' },
  { id: 2, name: 'Research Article' },
  { id: 3, name: 'Supplementary Information' },
  { id: 4, name: 'Case Report' },
  { id: 5, name: 'Editorial' },
  { id: 6, name: 'Short Communication' },
  { id: 7, name: 'Letter to Editor' },
  { id: 8, name: 'Clinical Images' },
  { id: 9, name: 'Images Section' },
  { id: 10, name: 'Pictorial Essay' },
  { id: 11, name: 'Commentary' },
  { id: 12, name: 'Case Series' },
];

const Archives = () => {
  const [journals, setJournals] = useState<JournalOption[]>([]);
  const [selectedJournal, setSelectedJournal] = useState('');
  const [archiveType, setArchiveType] = useState('');
  const [archiveData, setArchiveData] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const confirmDelete = useConfirmDelete();
  
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await axiosInstance.get('getOnlyJournals');
      setJournals(response?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch journals', error);
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    fetchArchiveData();
  };

  const fetchArchiveData = async () => {
    setLoadingState(true);
    const response = await axiosInstance.post(`getJournalArchives`, {
      archive_in: archiveType,
      journal_id: selectedJournal,
    });
    setArchiveData(response?.data?.data || []);
    setLoadingState(false);
  }

  const handleEdit = (userData: any) => {
    handleOpen();
    setUserData(userData);
    setShowModal(true);
  };

  const isLocalhost = window.location.hostname.includes('localhost');
  const fulltextBaseUrl = isLocalhost
    ? 'http://localhost/openscience/fulltextarticles/'
    : 'https://www.opensciencepublications.com/fulltextarticles/';
  const archivePdfBaseUrl = isLocalhost
    ? 'http://localhost/openscience/wp-content/uploads/'
    : 'https://www.opensciencepublications.com/wp-content/uploads/';

  const [columnDefs] = useState([
    { headerName: "journal Name", field: "journal_name", width: 300 },
    { headerName: "Article Title", field: "article_title", width: 300 },
    { headerName: "Article Link", field: "article_link", width: 250 },
    { headerName: "Article Author", field: "article_authors", width: 220 },
    { headerName: "Volume", field: "volume_name", width: 140 },
    { headerName: "Archive In", width: 170, field: "archive_in", cellRenderer: (params: any) => {
      const archiveIn = params.value;
      const archiveType = archiveTypes.find(type => String(type.id) === String(archiveIn));
      return archiveType ? archiveType.name : 'Unknown';
    } },
    { headerName: "Article Type", width: 220, field: "article_type", cellRenderer: (params: any) => {
      const articleType = articleTypes.find(type => String(type.id) === String(params.value));
      return articleType ? articleType.name : '';
    } },
    {
      headerName: "Article Fulltext",
      field: "archive_fulltext",
      width: 250,
      cellRenderer: (params: any) => params.value ? (
        <a href={`${fulltextBaseUrl}${params.value}`} target="_blank" rel="noopener noreferrer">
          {params.value}
        </a>
      ) : '',
    },
    { headerName: "Archive Year", field: "archive_year", width: 110 },
    {
      headerName: "Archive Pdf",
      field: "archive_pdf",
      width: 250,
      cellRenderer: (params: any) => params.value ? (
        <a href={`${archivePdfBaseUrl}${params.value}`} target="_blank" rel="noopener noreferrer">
          {params.value}
        </a>
      ) : '',
    },
    { headerName: "Supli Pdf", field: "supli_pdf", width: 250 },
  ]);

  const getTitle = () => {
    return userData?.id ? "Edit Archive" : "Create Archive";
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

  
  const handleFormSubmit = () => {
    setShowModal(false);
    //fetchUsers();
  };

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };


  const deleteRow = (archive: any) => {
    confirmDelete({
      title: 'Delete Archive',
      body: (
        <span>
          `Are you sure you want to delete this <b>{archive.article_title}</b>`?
        </span>
      ),
      onDeleteAction: async () => {
        if (!archive?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteArchive/${archive.id}`);
          await fetchArchiveData();
        } catch (error) {
          console.error("Failed to delete collaboration", error);
        } finally {
          setLoadingState(false);
        }
      },
    });
  };


  return (
    <>
      <div className="page">
        <div className="page-header">
          <h1>Select Journal Articles</h1>
        </div>
        <div className="create-btn">
        <button className="btn btn-primary" onClick={handleOpen}>
          Create Journal Archive
        </button>
      </div>
      </div>
      <div className="page-content">
        <div className="container">
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Journal Name</label>
              <select
                className="form-select"
                value={selectedJournal}
                onChange={(event) => setSelectedJournal(event.target.value)}
              >
                <option value="">Select Journal</option>
                {journals.map((journal) => (
                  <option value={journal.id} key={journal.id}>
                    {journal.journal_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Archive Type</label>
              <select
                className="form-select"
                value={archiveType}
                onChange={(event) => setArchiveType(event.target.value)}
              >
                <option value="">Select Archive Type</option>
                {archiveTypes.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        </div><br/>
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateJournalArchive ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
            onClose={handleClose}
            loading={loading}
            onConfirm={handleConfirm}
            backdrop="static"
          />
         <div className="container">
        { archiveData.length > 0 && (
         
            <div className="table-data archive-page">
              <CustomAgGrid
                loadingState={loadingState}
                columnDefs={columnDefs}
                rowData={archiveData}
                enableDelete={true}
                onEdit={handleEdit}
                onDelete={deleteRow}
              />
            </div>
          
        ) }{archiveData.length === 0 && !loadingState && (
          <div className="no-data-message">No Data Found, Try changing the filters</div>
        )}
        </div>
      </div>
    </>
  );
};

export default Archives;

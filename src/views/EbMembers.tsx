import { useEffect, useRef, useState } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import CreateEbMember from "./forms/CreateEbMember";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';

interface JournalOption {
  id: number;
  journal_name: string;
}

const EbMembers = () => {
  const [journals, setJournals] = useState<JournalOption[]>([]);
  const [selectedJournal, setSelectedJournal] = useState('');
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
    fetchEbMembers();
  };

  const fetchEbMembers = async () => {
    setLoadingState(true);
    const response = await axiosInstance.get(`getEbMembersByJournalId/${selectedJournal}`);
    setArchiveData(response?.data?.data || []);
    setLoadingState(false);
  }

  const handleEdit = (userData: any) => {
    handleOpen();
    setUserData(userData);
    setShowModal(true);
  };

  const isLocalhost = window.location.hostname.includes('localhost');
  const ebMemberPhotoBaseUrl = isLocalhost
    ? 'http://localhost/openscience/wp-content/uploads/'
    : 'https://www.opensciencepublications.com/wp-content/uploads/';

  const [columnDefs] = useState([
    { headerName: "Journal Name", field: "journal_name", width: 300 },
    { headerName: "Eb Member Name", field: "eb_member_name", width: 250 },
    { headerName: "Eb Member Email", field: "eb_member_email", width: 250 },
    { headerName: "Eb Member Photo", field: "eb_member_photo", cellRenderer: (params: any) => {
      if (!params.value) return <span>No Image found</span>;
      return (
        <>
          <img
            src={`${ebMemberPhotoBaseUrl}${params.value}`}
            alt="EB Member Photo"
            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.nextElementSibling?.removeAttribute('hidden');
            }}
          />
          <span hidden>No Image found</span>
        </>
      );
    }, autoHeight: true},
    { headerName: 'Editor Chief', field: 'editor_chief', width: 150, cellRenderer: (params: any) => {
      return params.value == '0' ? 'No' : 'Yes'
    }},
    { headerName: 'Eb Member Country', field: 'eb_member_country', width: 200 },
    { headerName: 'Updated Date', field: 'updated_date'}
  ]);

  const getTitle = () => {
    return userData?.id ? "Edit Eb Member" : "Create Eb Member";
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
    fetchEbMembers();
  };

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };


  const deleteRow = (ebMember: any) => {
    confirmDelete({
      title: 'Delete Archive',
      body: (
        <span>
          `Are you sure you want to delete this <b>{ebMember.eb_member_name}</b>`?
        </span>
      ),
      onDeleteAction: async () => {
        if (!ebMember?.id) return;
        try {
          setLoadingState(true);
          await axiosInstance.delete(`/deleteEbMember/${ebMember.id}`);
          await fetchEbMembers();
        } catch (error) {
          console.error("Failed to delete Eb Member", error);
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
          <h1>Editorial Board Members</h1>
        </div>
        <div className="create-btn">
        <button className="btn btn-primary" onClick={handleOpen}>
          Create EB Member
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
              <button type="submit" className="btn btn-primary">
                Get EB Members
              </button>
            </div>
          </form>
        </div><br/>
         <CommonModal
            size="xl"
            show={showModal}
            title={getTitle()}
            body={<CreateEbMember ref={formRef} getLoading={handleLoading} onConfirm={handleFormSubmit} userData={userData} />}
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

export default EbMembers;

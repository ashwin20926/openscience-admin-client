import { useEffect, useRef, useState } from 'react';
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from '../common/CustomAgGrid';
import CommonModal from '../common/CommonModal';
import CreateEbMember from "./forms/CreateEbMember";
import { useConfirmDelete } from '../common/ConfirmDeleteContext';

interface JournalOption {
  id: number;
  journal_name: string;
  category_name: string;
  category_id: number;
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


  const groupedJournals = journals.reduce<Record<string, JournalOption[]>>((acc, journal) => {
    const group = journal.category_name || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(journal);
    return acc;
  }, {});

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

  const [columnDefs] = useState([
    { headerName: "Category Name", field: "category_name", width: 150 },
    { headerName: "Journal Name", field: "journal_name", width: 300 },
    { headerName: "Eb Member Name", field: "eb_member_name", width: 250 },
    { headerName: "Eb Member Email", field: "eb_member_email", width: 250 },
    { headerName: "Eb Member Photo", field: "eb_member_photo", width: 200, cellRenderer: (params: any) => {
      if (!params.value) return;
      return <img src={`https://www.avensonline.org/wp-content/uploads/${params.value}`}  alt="EB Member Photo" />
    }, autoHeight: true},
    { headerName: 'Eb Member Country', field: 'eb_member_country', width: 200 },
    { headerName: 'Editor Chief', field: 'editor_chief', width: 150, cellRenderer: (params: any) => {
      return params.value == '0' ? 'No' : 'Yes'
    }},
    { headerName: 'Post Slug', field: 'eb_post_slug', width: 200 },
    { headerName: 'Journal Slug', field: 'eb_journal_slug', width: 250  },
    { headerName: 'Updated Date', field: 'updated_date'}
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
                {Object.entries(groupedJournals).map(([categoryName, items]) => (
                  <optgroup label={categoryName} key={categoryName}>
                    {items.map((journal) => (
                      <option value={journal.id} key={journal.id}>
                        {journal.journal_name}
                      </option>
                    ))}
                  </optgroup>
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

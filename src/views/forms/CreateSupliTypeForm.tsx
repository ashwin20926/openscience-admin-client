import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import axiosInstance from '../../auth/axiosInstance';

type CreateJournalArchiveHandle = {
  requestSubmit: () => void;
};

interface CreateLatestArticleProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

interface CreateSupliFormData {
  supli_name: string;
  journal_id: string;
}

const CreateSupliForm = forwardRef<CreateJournalArchiveHandle, CreateLatestArticleProps>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<CreateSupliFormData>({
    supli_name: '',
    journal_id: '',
  });

  const [serverMsg, setServerMsg] = useState('');
  const [, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => formRef.current?.requestSubmit(),
  }));

  const [journalGroups, setJournalGroups] = useState<Array<{ categoryName: string; journals: Array<{ id: string | number; label: string }> }>>([]);
  const [journalLoading, setJournalLoading] = useState(false);


  const fetchJournalOptions = async () => {
    try {
      setJournalLoading(true);
      const response = await axiosInstance.get('getOnlyJournals');
      const data = response?.data?.data || [];

      const grouped: Record<string, Array<{ id: string | number; label: string }>> = {};

      data.forEach((item: any) => {
        const categoryName = item.category_name || 'Uncategorized';
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }

        grouped[categoryName].push({
          id: item.id ?? item.journal_id ?? '',
          label: item.journal_name || `Journal ${item.id}`,
        });
      });

      const groupedOptions: Array<{ categoryName: string; journals: Array<{ id: string | number; label: string }> }> = Object.keys(grouped).map((categoryName) => ({
        categoryName,
        journals: grouped[categoryName],
      }));

      setJournalGroups(groupedOptions);
    } catch (error) {
      console.error('Failed to fetch journal options', error);
      setJournalGroups([]);
    } finally {
      setJournalLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalOptions();
  }, []);

  useEffect(() => {
    const loadSupliDate = async () => {
      console.log(userData)
      if (!userData?.id) return;
      try {
        setLoading(true);
        getLoading(true);
        const response = await axiosInstance.get(`getSupliTypeById/${userData.id}`);
        const supliName = response?.data?.data?.[0];

        if (!supliName) return;
        setFormData({
          supli_name: supliName.supli_name?.toString() || '',
          journal_id: supliName.journal_id || null
        });
      } catch (error) {
        console.error('Failed to load Latest Article', error);
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadSupliDate();
  }, [userData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(107)
    e.preventDefault();
    setLoading(true);
    getLoading(true);
    setServerMsg('Saving...');

    try {
      const updatedData = { ...formData };

      // Map client form keys to server expected snake_case keys
      const payload: any = {
        id: userData?.id ?? undefined,
        journal_id: updatedData.journal_id || '',
        supli_name: updatedData.supli_name || ''
      };

      const response = await axiosInstance.post('saveOrUpdateSupliType', payload);      
      const msg = response?.data?.message || 'Supli Type saved successfully!';
      setFormData(updatedData);
      setServerMsg(msg);
      onConfirm?.(updatedData);
    } catch (error: any) {
      console.log(error)
      console.error('Upload failed', error);
      setServerMsg(error?.response?.data?.message || 'Failed to upload files.');
    } finally {
      setLoading(false);
      getLoading(false);
    }
  };

  return (
    <div id="main-wrapper" className="container-fluid py-4">
      <div className="card shadow-sm mx-auto">
        <div className="card-body p-4">
          <form ref={formRef} onSubmit={handleSubmit} id="journal_latest_article_form">            
            <div className="row mb-3 align-items-center">
              <label htmlFor="supli_name" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Supli Name *
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="supli_name"
                  name="supli_name"
                  className="form-control"
                  required
                  value={formData.supli_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="journal_id" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Journal Name *
              </label>
              <div className="col-sm-9">
                <select
                  id="journal_id"
                  required
                  name="journal_id"
                  className="form-select"
                  value={formData.journal_id}
                  onChange={handleChange}
                >
                  <option value="">
                    {journalLoading ? 'Loading journals...' : 'Select Journal'}
                  </option>
                  {journalGroups.map((group) => (
                    <optgroup key={group.categoryName} label={group.categoryName}>
                      {group.journals.map((journal) => (
                        <option key={journal.id} value={journal.id}>
                          {journal.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-sm-9 offset-sm-3">
                {serverMsg && (
                  <div className="mt-3 text-success fw-semibold">{serverMsg}</div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default CreateSupliForm;
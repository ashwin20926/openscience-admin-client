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

type UploadFieldValue = File | string | null;

interface CreateLatestArticleFormData {
  article_name: string;
  article_category: string;
  author_name: string;
  pdf_link: string;
  // Update this line to support files, text URLs, and empty states:
  article_image: File | string | null; 
  id?: string | number | null;
}

const CreateLatestArticleForm = forwardRef<CreateJournalArchiveHandle, CreateLatestArticleProps>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<CreateLatestArticleFormData>({
    article_category: '',
    article_name: '',
    author_name: '',
    article_image: '',
    pdf_link: '',
    id: null,
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
    const loadArchiveData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);
        const response = await axiosInstance.get(`getLatestArticleById/${userData.id}`);
        const archive = response?.data?.data?.[0];

        if (!archive) return;
        setFormData({
          article_category: archive.article_category?.toString() || '',
          id: archive.id || null,
          article_name: archive.article_name || '',
          author_name: archive.author_name || '',
          article_image: archive.article_image || '',
          pdf_link: archive.pdf_link || ''
        });
      } catch (error) {
        console.error('Failed to load Latest Article', error);
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadArchiveData();
  }, [userData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'article_image') => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const removeFile = (fieldName: 'article_image') => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };


  const getFilename = (value: UploadFieldValue) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parts = trimmed.split('/');
    return parts[parts.length - 1];
  };

  const uploadFile = async (fieldName: 'article_image') => {
    const file = formData[fieldName];
    if (!(file instanceof File)) return null;

    const formDataUpload = new FormData();
    formDataUpload.append(fieldName, file);

    const response = await axiosInstance.post(`upload-files`, formDataUpload);
    return response?.data?.file_data?.upload_data?.file_name || null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    getLoading(true);
    setServerMsg('Saving...');

    try {
      const updatedData = { ...formData };

      const articleImage = await uploadFile('article_image');
      if (articleImage) {
        updatedData.article_image = articleImage;
      }

      // Map client form keys to server expected snake_case keys
      const payload: any = {
        id: updatedData.id ?? undefined,
        article_name: updatedData.article_name || '',
        pdf_link: updatedData.pdf_link || '',
        article_category: updatedData.article_category || '',
        author_name: updatedData.author_name || '',
        article_image: getFilename(updatedData.article_image)
      };

      const response = await axiosInstance.post('saveOrUpdateArticle', payload);
      const msg = response?.data?.message || 'Latest article saved successfully!';
      setFormData(updatedData);
      setServerMsg(msg);
      onConfirm?.(updatedData);
    } catch (error: any) {
      console.error('Upload failed', error);
      setServerMsg(error?.message || 'Failed to upload files.');
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
              <label htmlFor="article_title" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article Name *
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="article_name"
                  name="article_name"
                  className="form-control"
                  required
                  value={formData.article_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="article_title" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Pdf Link *
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="pdf_link"
                  name="pdf_link"
                  className="form-control"
                  value={formData.pdf_link}
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
                  name="article_category"
                  className="form-select"
                  value={formData.article_category}
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

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_image" className="col-sm-3 col-form-label text-sm-end fw-semibold">
               Article Image *
              </label>
              <div className="col-sm-9">
                <input
                  type="file"
                  id="article_image"
                  required
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'article_image')}
                />
                {formData.article_image && (
                  <div className="d-flex align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="me-auto text-truncate">
                      {formData.article_image instanceof File ? formData.article_image.name : String(formData.article_image)}
                    </span>
                    <button
                      type="button"
                      className="btn-close ms-2"
                      aria-label="Remove"
                      onClick={() => removeFile('article_image')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_link" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Author Name * 
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="article_link"
                  name="author_name"
                  className="form-control"
                  value={formData.author_name}
                  onChange={handleChange}
                />
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

export default CreateLatestArticleForm;
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import axiosInstance from '../../auth/axiosInstance';

type CreateJournalArchiveHandle = {
  requestSubmit: () => void;
};

interface CreateTestimonialsProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

type UploadFieldValue = File | string | null;

interface CreateTestimonialsFormData {
  user_name: string;
  testimonial_desc: string;
  user_desig: string;
  // Update this line to support files, text URLs, and empty states:
  user_img: File | string | null; 
  user_university: string,
  id?: string | number | null;
}

const CreateTestimonialsForm = forwardRef<CreateJournalArchiveHandle, CreateTestimonialsProps>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<CreateTestimonialsFormData>({
    user_name: '',
    testimonial_desc: '',
    user_img: '',
    user_desig: '',
    user_university: '',
    id: null,
  });

  const [serverMsg, setServerMsg] = useState('');
  const [, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => formRef.current?.requestSubmit(),
  }));

  useEffect(() => {
    const loadTestimonialData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);
        const response = await axiosInstance.get(`getTestimonialById/${userData.id}`);
        const archive = response?.data?.data?.[0];

        if (!archive) return;
        setFormData({
          id: archive.id || null,
          user_name: archive.user_name || '',
          testimonial_desc: archive.testimonial_desc || '',
          user_img: archive.user_img || '',
          user_desig: archive.user_desig || '',
          user_university: archive.user_university || ''
        });
      } catch (error) {
        console.error('Failed to load Latest Article', error);
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadTestimonialData();
  }, [userData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'user_img') => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const removeFile = (fieldName: 'user_img') => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };


  const getFilename = (value: UploadFieldValue) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parts = trimmed.split('/');
    return parts[parts.length - 1];
  };

  const uploadFile = async (fieldName: 'user_img') => {
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

      const articleImage = await uploadFile('user_img');
      if (articleImage) {
        updatedData.user_img = articleImage;
      }

      // Map client form keys to server expected snake_case keys
      const payload: any = {
        id: updatedData.id ?? undefined,
        user_name: updatedData.user_name || '',
        user_desig: updatedData.user_desig || '',
        testimonial_desc: updatedData.testimonial_desc || '',
        user_img: getFilename(updatedData.user_img),
        user_university: updatedData.user_university || ''
      };

      const response = await axiosInstance.post('addOrUpdateTestimonials', payload);
      const msg = response?.data?.message || 'Testimonial saved successfully!';
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
              <label htmlFor="user_name" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                User Name *
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  className="form-control"
                  required
                  value={formData.user_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="testimonial_desc" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Testimonial Description *
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="testimonial_desc"
                  name="testimonial_desc"
                  className="form-control"
                  value={formData.testimonial_desc}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="user_img" className="col-sm-3 col-form-label text-sm-end fw-semibold">
               User Image *
              </label>
              <div className="col-sm-9">
                <input
                  type="file"
                  id="user_img"
                  required={!formData.user_img}
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'user_img')}
                />
                {formData.user_img && (
                  <div className="d-flex align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="me-auto text-truncate">
                      {formData.user_img instanceof File ? formData.user_img.name : String(formData.user_img)}
                    </span>
                    <button
                      type="button"
                      className="btn-close ms-2"
                      aria-label="Remove"
                      onClick={() => removeFile('user_img')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="user_desig" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                User Designation * 
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="user_desig"
                  name="user_desig"
                  className="form-control"
                  value={formData.user_desig}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="row mb-3 align-items-center">
              <label htmlFor="user_university" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                User University * 
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="user_university"
                  name="user_university"
                  className="form-control"
                  value={formData.user_university}
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

export default CreateTestimonialsForm;
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import moment from 'moment';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import axiosInstance from '../../auth/axiosInstance';

;(window as any).tinymce = tinymce;
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/models/dom/model';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';

import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';

type CreateJournalArchiveHandle = {
  requestSubmit: () => void;
};

interface CreateJournalArchiveProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

type UploadFieldValue = File | string | null;

interface CreateJournalArchiveFormData {
  categoryId: string;
  journalId: string;
  archiveDesc: string;
  articleTitle: string;
  articleLink: string;
  articlePubDate: string;
  articleAuthors: string;
  doiName: string;
  doiLink: string;
  archiveIn: string;
  archiveYear: string;
  archiveVolume: string;
  archiveFulltext: string;
  archivePdf: UploadFieldValue;
  supliPdf: UploadFieldValue;
  id?: number | string | null;
}

const CreateJournalPage = forwardRef<CreateJournalArchiveHandle, CreateJournalArchiveProps>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<CreateJournalArchiveFormData>({
    categoryId: '',
    journalId: '',
    archiveDesc: '',
    articleTitle: '',
    articleLink: '',
    articlePubDate: '',
    articleAuthors: '',
    doiName: '',
    doiLink: '',
    archiveIn: '',
    archiveYear: '',
    archiveVolume: '',
    archiveFulltext: '',
    archivePdf: null,
    supliPdf: null,
    id: null,
  });

  const [serverMsg, setServerMsg] = useState('');
  const [, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => formRef.current?.requestSubmit(),
  }));
  const [journalGroups, setJournalGroups] = useState<Array<{ categoryName: string; journals: Array<{ id: string | number; label: string }> }>>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [volumeOptions, setVolumeOptions] = useState<Array<{ id: string | number; label: string }>>([]);
  const [volumeLoading, setVolumeLoading] = useState(false);

  const categories = [
    { id: '10', name: 'Medical' },
    { id: '20', name: 'Biotechnology' },
    { id: '30', name: 'Biology' },
    { id: '40', name: 'Pharmaceutical' },
  ];

  const archiveYears = Array.from({ length: 27 }, (_, i) => 2000 + i);

  const formatDateForInput = (value: string | null | undefined) => {
    if (!value) return '';

    const trimmed = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const parsed = moment(trimmed, ['YYYY-MM-DD', 'DD MMM, YYYY', 'DD MMMM, YYYY', 'DD MMM YYYY', 'YYYY/MM/DD', 'MMMM DD, YYYY'], true);
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD');
    }

    return '';
  };

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

  const fetchVolumeOptions = async () => {
    try {
      setVolumeLoading(true);
      const response = await axiosInstance.get('getVolumes');
      const data = response?.data?.data || [];

      const options = data.map((item: any) => ({
        id: item.id ?? item.volume_id ?? '',
        label: item.volume_name || item.volume || item.name || `Volume ${item.id}`,
      }));

      setVolumeOptions(options);
    } catch (error) {
      console.error('Failed to fetch volume options', error);
      setVolumeOptions([]);
    } finally {
      setVolumeLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalOptions();
    fetchVolumeOptions();
  }, []);

  useEffect(() => {
    const loadArchiveData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);
        const response = await axiosInstance.get(`getJournalArchivesById/${userData.id}`);
        const archive = response?.data?.data?.[0];

        if (!archive) return;

        setFormData({
          categoryId: archive.category_id?.toString() || '',
          journalId: archive.journal_id?.toString() || '',
          id: archive.id || null,
          archiveDesc: archive.archive_desc || '',
          articleTitle: archive.article_title || '',
          articleLink: archive.article_link || '',
          articlePubDate: formatDateForInput(archive.article_pub_date),
          articleAuthors: archive.article_authors || '',
          doiName: archive.doi_name || '',
          doiLink: archive.doi_link || '',
          archiveIn: archive.archive_in?.toString() || '',
          archiveYear: archive.archive_year?.toString() || '',
          archiveVolume: archive.archive_volume?.toString() || '',
          archiveFulltext: archive.archive_fulltext || '',
          archivePdf: archive.archive_pdf || null,
          supliPdf: archive.supli_pdf || null,
        });
      } catch (error) {
        console.error('Failed to load archive data', error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'archivePdf' | 'supliPdf') => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const removeFile = (fieldName: 'archivePdf' | 'supliPdf') => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, archiveDesc: content }));
  };

  const getFilename = (value: UploadFieldValue) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parts = trimmed.split('/');
    return parts[parts.length - 1];
  };

  const uploadFile = async (fieldName: 'archivePdf' | 'supliPdf') => {
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

      const archivePdfName = await uploadFile('archivePdf');
      if (archivePdfName) {
        updatedData.archivePdf = archivePdfName;
      }

      const supliPdfName = await uploadFile('supliPdf');
      if (supliPdfName) {
        updatedData.supliPdf = supliPdfName;
      }

      // Map client form keys to server expected snake_case keys
      const payload: any = {
        id: updatedData.id ?? undefined,
        article_pub_date: updatedData.articlePubDate || '',
        article_title: updatedData.articleTitle || '',
        article_link: updatedData.articleLink || '',
        article_authors: updatedData.articleAuthors || '',
        doi_name: updatedData.doiName || '',
        doi_link: updatedData.doiLink || '',
        journal_id: updatedData.journalId || '',
        category_id: updatedData.categoryId || '',
        archive_desc: updatedData.archiveDesc || '',
        archive_doi: updatedData.doiName || '',
        archive_year: updatedData.archiveYear || '',
        archive_volume: updatedData.archiveVolume || '',
        archive_fulltext: updatedData.archiveFulltext || '',
        archive_pdf: getFilename(updatedData.archivePdf),
        supli_pdf: getFilename(updatedData.supliPdf),
        archive_in: updatedData.archiveIn || '',
        journal_slug: '',
      };

      const response = await axiosInstance.post('updateArchive', payload);
      const msg = response?.data?.message || 'Journal page saved successfully!';
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
          <form ref={formRef} onSubmit={handleSubmit} id="journal_archive_form">
            <div className="row mb-3 align-items-center">
              <label htmlFor="category_id" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Category Name
              </label>
              <div className="col-sm-9">
                <select
                  id="category_id"
                  name="categoryId"
                  className="form-select"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="journal_id" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Journal Name
              </label>
              <div className="col-sm-9">
                <select
                  id="journal_id"
                  name="journalId"
                  className="form-select"
                  value={formData.journalId}
                  onChange={handleChange}
                  required
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

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive Content
              </label>
              <div className="col-sm-9">
                <Editor
                  licenseKey="gpl"
                  value={formData.archiveDesc}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'code',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table',
                    ],
                    toolbar:
                      'undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                    skin: 'oxide',
                    content_css: 'default',
                  }}
                  onEditorChange={handleEditorChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_title" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article title
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="article_title"
                  name="articleTitle"
                  className="form-control"
                  value={formData.articleTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_link" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article link
              </label>
              <div className="col-sm-9">
                <input
                  type="url"
                  id="article_link"
                  name="articleLink"
                  className="form-control"
                  value={formData.articleLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_pub_date" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article published date
              </label>
              <div className="col-sm-9">
                <input
                  type="date"
                  id="article_pub_date"
                  name="articlePubDate"
                  className="form-control"
                  value={formData.articlePubDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="article_authors" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article authors
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="article_authors"
                  name="articleAuthors"
                  className="form-control"
                  value={formData.articleAuthors}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="doi_name" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article DOI
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="doi_name"
                  name="doiName"
                  className="form-control"
                  value={formData.doiName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="doi_link" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Article DOI link
              </label>
              <div className="col-sm-9">
                <input
                  type="url"
                  id="doi_link"
                  name="doiLink"
                  className="form-control"
                  value={formData.doiLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="archive_in" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive In
              </label>
              <div className="col-sm-9">
                <select
                  id="archive_in"
                  name="archiveIn"
                  className="form-select"
                  value={formData.archiveIn}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="1">Article In Press</option>
                  <option value="2">Current Issue</option>
                  <option value="3">Archive</option>
                  <option value="4">Special Issues</option>
                </select>
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="archive_year" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive Year
              </label>
              <div className="col-sm-9">
                <select
                  id="archive_year"
                  name="archiveYear"
                  className="form-select"
                  value={formData.archiveYear}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {archiveYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="archive_volume" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive Volume
              </label>
              <div className="col-sm-9">
                <select
                  id="archive_volume"
                  name="archiveVolume"
                  className="form-select"
                  value={formData.archiveVolume}
                  onChange={handleChange}
                >
                  <option value="">
                    {volumeLoading ? 'Loading volumes...' : 'Select Archive'}
                  </option>
                  {volumeOptions.map((volume) => (
                    <option key={volume.id} value={volume.id}>
                      {volume.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="archive_fulltext" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive Fulltext
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="archive_fulltext"
                  name="archiveFulltext"
                  className="form-control"
                  value={formData.archiveFulltext}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="archive_pdf" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Archive PDF
              </label>
              <div className="col-sm-9">
                <input
                  type="file"
                  id="archive_pdf"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'archivePdf')}
                />
                {formData.archivePdf && (
                  <div className="d-flex align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="me-auto text-truncate">
                      {formData.archivePdf instanceof File ? formData.archivePdf.name : String(formData.archivePdf)}
                    </span>
                    <button
                      type="button"
                      className="btn-close ms-2"
                      aria-label="Remove"
                      onClick={() => removeFile('archivePdf')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label htmlFor="supli_pdf" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                S PDF
              </label>
              <div className="col-sm-9">
                <input
                  type="file"
                  id="supli_pdf"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, 'supliPdf')}
                />
                {formData.supliPdf && (
                  <div className="d-flex align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="me-auto text-truncate">
                      {formData.supliPdf instanceof File ? formData.supliPdf.name : String(formData.supliPdf)}
                    </span>
                    <button
                      type="button"
                      className="btn-close ms-2"
                      aria-label="Remove"
                      onClick={() => removeFile('supliPdf')}
                    />
                  </div>
                )}
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

export default CreateJournalPage;
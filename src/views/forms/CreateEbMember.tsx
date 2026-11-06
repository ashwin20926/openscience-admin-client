import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

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
  eb_member_photo: UploadFieldValue;
  eb_member_email: string;
  eb_member_name: string;
  eb_journal_slug: string;
  eb_post_slug: string;
  id?: number | string | null;
  category_id: string;
  journal_id: string;
  eb_member_country: string;
  editor_chief: string;
  eb_member_desc: string;
}

interface JournalOption {
  id: string | number;
  label: string;
}

interface JournalGroup {
  categoryName: string;
  journals: JournalOption[];
}

const CreateJournalPage = forwardRef<
  CreateJournalArchiveHandle,
  CreateJournalArchiveProps
>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formData, setFormData] =
    useState<CreateJournalArchiveFormData>({
      eb_member_photo: '',
      eb_member_email: '',
      eb_member_name: '',
      eb_journal_slug: '',
      eb_post_slug: '',
      id: '',
      category_id: '',
      journal_id: '',
      eb_member_country: '',
      editor_chief: '0',
      eb_member_desc: '',
    });

  const [serverMsg, setServerMsg] = useState('');
  const [, setLoading] = useState(false);

  const [journalGroups, setJournalGroups] = useState<JournalGroup[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  const categories = [
    { id: '10', name: 'Medical' },
    { id: '20', name: 'Biotechnology' },
    { id: '30', name: 'Biology' },
    { id: '40', name: 'Pharmaceutical' },
  ];

  useImperativeHandle(ref, () => ({
    requestSubmit: () => {
      formRef.current?.requestSubmit();
    },
  }));

  /**
   * Fetch journals
   */
  const fetchJournalOptions = async () => {
    try {
      setJournalLoading(true);

      const response = await axiosInstance.get('getOnlyJournals');

      const data = response?.data?.data || [];

      const grouped: Record<string, JournalOption[]> = {};

      data.forEach((item: any) => {
        const categoryName =
          item.category_name || 'Uncategorized';

        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }

        grouped[categoryName].push({
          id: item.id ?? item.journal_id ?? '',
          label:
            item.journal_name ||
            `Journal ${item.id ?? item.journal_id ?? ''}`,
        });
      });

      const groupedOptions: JournalGroup[] = Object.keys(
        grouped
      ).map((categoryName) => ({
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

  /**
   * Load existing archive data
   */
  useEffect(() => {
    const loadEbMemberData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);

        const response = await axiosInstance.get(
          `getEbMemberById/${userData.id}`
        );

        const ebMember = response?.data?.data?.[0];

        if (!ebMember) return;

        setFormData({
          category_id:
            ebMember.category_id != null
              ? String(ebMember.category_id)
              : '',

          journal_id:
            ebMember.journal_id != null
              ? String(ebMember.journal_id)
              : '',

          id: ebMember.id ?? null,

          eb_member_photo:
            ebMember.eb_member_photo || '',

          eb_member_email:
            ebMember.eb_member_email || '',

          eb_member_name:
            ebMember.eb_member_name || '',

          eb_journal_slug:
            ebMember.eb_journal_slug || '',

          eb_post_slug:
            ebMember.eb_post_slug || '',

          eb_member_country:
            ebMember.eb_member_country || '',

          /**
           * IMPORTANT:
           * Always convert API value to string.
           * This ensures radio checked values work correctly.
           */
          editor_chief:
            ebMember.editor_chief !== null &&
            ebMember.editor_chief !== undefined
              ? String(ebMember.editor_chief)
              : '0',

          eb_member_desc:
            ebMember.eb_member_desc || '',
        });
      } catch (error) {
        console.error(
          'Failed to load archive data',
          error
        );
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadEbMemberData();
  }, [userData?.id, getLoading]);

  /**
   * Handle input/select changes
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle member photo upload
   */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;

    setFormData((prev) => ({
      ...prev,
      eb_member_photo: file,
    }));
  };

  /**
   * Remove member photo
   */
  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      eb_member_photo: null,
    }));
  };

  /**
   * TinyMCE change
   */
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      eb_member_desc: content,
    }));
  };

  /**
   * Upload file
   */
  const uploadFile = async (
    fieldName: 'eb_member_photo'
  ) => {
    const file = formData[fieldName];

    if (!(file instanceof File)) {
      return null;
    }

    const formDataUpload = new FormData();

    formDataUpload.append(fieldName, file);

    const response = await axiosInstance.post(
      'upload-files',
      formDataUpload
    );

    return (
      response?.data?.file_data?.upload_data?.file_name ||
      null
    );
  };

  /**
   * Submit form
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    getLoading(true);
    setServerMsg('Saving...');

    try {
      const updatedData = {
        ...formData,
      };

      /**
       * Upload member photo if a new file was selected
       */
      const uploadedPhotoName =
        await uploadFile('eb_member_photo');

      if (uploadedPhotoName) {
        updatedData.eb_member_photo =
          uploadedPhotoName;
      }

      /**
       * API payload
       */
      const payload = {
        id: updatedData.id ?? undefined,

        eb_member_photo:
          typeof updatedData.eb_member_photo ===
          'string'
            ? updatedData.eb_member_photo
            : '',

        eb_member_email:
          updatedData.eb_member_email || '',

        eb_member_name:
          updatedData.eb_member_name || '',

        eb_journal_slug:
          updatedData.eb_journal_slug || '',

        eb_post_slug:
          updatedData.eb_post_slug || '',

        journal_id:
          updatedData.journal_id || '',

        category_id:
          updatedData.category_id || '',

        eb_member_country:
          updatedData.eb_member_country || '',

        /**
         * This will now always be "0" or "1"
         */
        editor_chief:
          updatedData.editor_chief || '0',

        eb_member_desc:
          updatedData.eb_member_desc || '',
      };

      console.log('Submitting payload:', payload);

      const response = await axiosInstance.post(
        'updateEbMember',
        payload
      );

      const msg =
        response?.data?.message ||
        'Journal page saved successfully!';

      setFormData(updatedData);
      setServerMsg(msg);

      onConfirm?.(updatedData);
    } catch (error: any) {
      console.error('Upload failed', error);

      setServerMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save data.'
      );
    } finally {
      setLoading(false);
      getLoading(false);
    }
  };

  return (
    <div
      id="main-wrapper"
      className="container-fluid py-4"
    >
      <div className="card shadow-sm mx-auto">
        <div className="card-body p-4">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            id="journal_archive_form"
          >
            {/* Post Slug */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_post_slug"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Slug
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="eb_post_slug"
                  name="eb_post_slug"
                  className="form-control"
                  value={formData.eb_post_slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Journal Slug */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_journal_slug"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Slug
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="eb_journal_slug"
                  name="eb_journal_slug"
                  className="form-control"
                  value={formData.eb_journal_slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* EB Member Name */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_member_name"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Eb Member Name
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="eb_member_name"
                  name="eb_member_name"
                  className="form-control"
                  value={formData.eb_member_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* EB Member Email */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_member_email"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Eb Member Email
              </label>

              <div className="col-sm-9">
                <input
                  type="email"
                  id="eb_member_email"
                  name="eb_member_email"
                  className="form-control"
                  value={formData.eb_member_email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Category */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="category_id"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Category Name
              </label>

              <div className="col-sm-9">
                <select
                  id="category_id"
                  name="category_id"
                  className="form-select"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Journal */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_id"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Name
              </label>

              <div className="col-sm-9">
                <select
                  id="journal_id"
                  name="journal_id"
                  className="form-select"
                  value={formData.journal_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {journalLoading
                      ? 'Loading journals...'
                      : 'Select Journal'}
                  </option>

                  {journalGroups.map((group) => (
                    <optgroup
                      key={group.categoryName}
                      label={group.categoryName}
                    >
                      {group.journals.map(
                        (journal) => (
                          <option
                            key={journal.id}
                            value={journal.id}
                          >
                            {journal.label}
                          </option>
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Country */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_member_country"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Eb Member Country
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="eb_member_country"
                  name="eb_member_country"
                  className="form-control"
                  value={
                    formData.eb_member_country
                  }
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Eb Member Description
              </label>

              <div className="col-sm-9">
                <Editor
                  licenseKey="gpl"
                  value={formData.eb_member_desc}
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
                  onEditorChange={
                    handleEditorChange
                  }
                />
              </div>
            </div>

            {/* Editor In Chief */}
            <div className="row mb-3 align-items-center">
              <label className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Editor In Chief
              </label>

              <div className="col-sm-9">
                {/* YES */}
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="editor_chief"
                    id="radioYes"
                    value="1"
                    checked={
                      formData.editor_chief ===
                      '1'
                    }
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="radioYes"
                  >
                    Yes
                  </label>
                </div>

                {/* NO */}
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="editor_chief"
                    id="radioNo"
                    value="0"
                    checked={
                      formData.editor_chief ===
                      '0'
                    }
                    onChange={handleChange}
                  />

                  <label
                    className="form-check-label"
                    htmlFor="radioNo"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* EB Member Photo */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="eb_member_photo"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Eb Member Photo
              </label>

              <div className="col-sm-9">
                <input
                  type="file"
                  id="eb_member_photo"
                  name="eb_member_photo"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {formData.eb_member_photo && (
                  <div className="d-flex align-items-center mt-2 p-2 bg-light rounded border">
                    <span className="me-auto text-truncate">
                      {formData.eb_member_photo instanceof
                      File
                        ? formData.eb_member_photo
                            .name
                        : String(
                            formData.eb_member_photo
                          )}
                    </span>

                    <button
                      type="button"
                      className="btn-close ms-2"
                      aria-label="Remove"
                      onClick={removeFile}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Server Message */}
            <div className="row mt-4">
              <div className="col-sm-9 offset-sm-3">
                {serverMsg && (
                  <div className="mt-3 text-success fw-semibold">
                    {serverMsg}
                  </div>
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
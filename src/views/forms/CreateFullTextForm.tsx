import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import axiosInstance from '../../auth/axiosInstance';

type CreateJournalArchiveHandle = {
  requestSubmit: () => void;
};

interface CreateJournalArchiveProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

type FullTextTagChild = {
  name: string;
  value?: string;
};

interface CreateJournalArchiveFormData {
  post_title: string;
  post_browser_title: string;
  post_browser_title_slug: string;
  post_meta_keywords: string;
  categoryId: string;
  journal_id: string;
  submission_date: string;
  publication_date: string;
  accepted_date: string;
  citation_volume: string;
  citation_issue: string;
  citation_first_page: string;
  citation_last_page: string;
  authors: string;
  ID: string;
}

type FullTextInsertableOption = {
  label?: string;
  name: string;
  placeholder?: string;
  child_tag?: FullTextTagChild[];
};

type FullTextTag = {
  label: string;
  name: string;
  label_show?: boolean;
  placeholder?: string;
  value?: string;
  value0?: string;
  value1?: string;
  value2?: string;
  child_tag?: FullTextTagChild[];
};

type FullTextSection = {
  label: string;
  name: string;
  insertableOptions?: FullTextInsertableOption[];
  tags?: FullTextTag[];
};

const CreateFullTextForm = forwardRef<CreateJournalArchiveHandle, CreateJournalArchiveProps>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<CreateJournalArchiveFormData>({
    ID: userData?.ID || '',
    post_title: '',
    post_browser_title: '',
    post_browser_title_slug: '',
    post_meta_keywords: '',
    categoryId: '',
    journal_id: '',
    submission_date: '',
    publication_date: '',
    accepted_date: '',
    citation_volume: '',
    citation_issue: '',
    citation_first_page: '',
    citation_last_page: '',
    authors: ""
  });
  const commonInsertableOptions: FullTextInsertableOption[] = [
    { label: 'Para without Heading', name: 'paragraph_without_heading', placeholder: 'Enter Paragraph' },
    { label: 'Para with Inline Heading', name: 'paragraph_with_inline_heading', placeholder: 'Enter Paragraph' },
    { label: 'Para with Block Heading', name: 'paragraph_with_block_heading', placeholder: 'Enter Paragraph' },
    { label: 'Figure Info box', name: 'figure_info_box', placeholder: 'Enter Image Discription' },
    { label: 'Reference Links', name: 'reference_links', placeholder: 'Please Enter Links' },
    { label: 'Figure Box', name: 'figure_box', placeholder: 'Please Enter image link' },
  ];
  const insertableOptions: FullTextInsertableOption[] = [
    { label: 'Paragraph without Heading', name: 'paragraph_without_heading', placeholder: 'Enter Paragraph' },
    { label: 'Paragraph with Inline Heading', name: 'paragraph_with_inline_heading', placeholder: 'Enter Paragraph', child_tag: [{ name: 'heading' }] },
    { label: 'Paragraph with Block Heading', name: 'paragraph_with_block_heading', placeholder: 'Enter Paragraph', child_tag: [{ name: 'heading' }] },
    { label: 'Figure Info box', name: 'figure_info_box', placeholder: 'Enter Paragraph', child_tag: [{ name: 'heading' }] },
    { label: 'Reference Items', name: 'reference_links', placeholder: 'Enter Paragraph', child_tag: [{ name: 'link' }] },
    { label: 'Figure Box', name: 'figure_box', placeholder: 'Please Enter image url', child_tag: [{ name: 'heading' }] },
  ];
  const titleInsertableOptions: FullTextTag[] = [
    { label: 'Article Type', name: 'article_type', label_show: true, value2: '' },
    { label: 'Main Heading', name: 'main_heading', label_show: true, value0: '' },
    { label: 'Author', name: 'author', label_show: true, value1: '' },
  ];
  const copyInsertableOptions: FullTextInsertableOption[] = JSON.parse(JSON.stringify(insertableOptions));
  const initialFtSections: FullTextSection[] = [
    { label: 'Title', name: 'title', insertableOptions: commonInsertableOptions, tags: titleInsertableOptions },
  ];
  const [ftSections, setFtSections] = useState<FullTextSection[]>(initialFtSections);
  
  const formatInsertableOptionText = (name: string) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const getUrlSlug = (value: string) =>
    value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const [serverMsg, setServerMsg] = useState('');
  const [journalLoading, setJournalLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const isFormBusy = formLoading || journalLoading;

  const addInsertableOption = (optionName: string, sectionName: string, sectionIndex?: number) => {
    setFtSections((prevSections) =>
      prevSections.map((section) => {
        if (section.name !== sectionName) {
          return section;
        }

        const option = copyInsertableOptions.find((item) => item.name === optionName);
        if (!option) {
          return section;
        }

        const existingTags = section.tags ?? [];
        const newTag: FullTextTag = {
          ...JSON.parse(JSON.stringify(option)),
          label: option.label || option.placeholder || formatInsertableOptionText(option.name),
          label_show: false,
          placeholder: option.placeholder,
          value: '',
          child_tag: option.child_tag ? JSON.parse(JSON.stringify(option.child_tag)) : undefined,
        };

        if (option.child_tag?.length) {
          newTag.child_tag = option.child_tag.map((child) => ({ ...child, value: '' }));
        }

        if (typeof sectionIndex === 'number' && sectionIndex >= 0) {
          const insertAt = Math.max(sectionIndex + 1, existingTags.length);
          return {
            ...section,
            tags: [...existingTags.slice(0, insertAt), newTag, ...existingTags.slice(insertAt)],
          };
        }

        return {
          ...section,
          tags: [...existingTags, newTag],
        };
      })
    );
  };

  const removeInsertableOption = (sectionIdentifier: string, tagIndex: number) => {
    setFtSections((prevSections) =>
      prevSections.map((section) => {
        if (section.name !== sectionIdentifier && section.label !== sectionIdentifier) {
          return section;
        }

        return {
          ...section,
          tags: (section.tags ?? []).filter((_, index) => index !== tagIndex),
        };
      })
    );
  };

  useImperativeHandle(ref, () => ({
    requestSubmit: () => formRef.current?.requestSubmit(),
  }));
  const [journalGroups, setJournalGroups] = useState<Array<{ categoryName: string; journals: Array<{ id: string | number; label: string }> }>>([]);

  const categories = [
    { id: '10', name: 'Medical' },
    { id: '20', name: 'Biotechnology' },
    { id: '30', name: 'Biology' },
    { id: '40', name: 'Pharmaceutical' },
  ];

  const handleSectionLabelChange = (index: number, value: string) => {
    const updatedFtSections = ftSections.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, label: value } : section
    );

    setFtSections(updatedFtSections);
  };

  const updateTagValue = (sectionIndex: number, tagIndex: number, value: string) => {
    setFtSections((prevSections) =>
      prevSections.map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          tags: (section.tags ?? []).map((tag, currentTagIndex) =>
            currentTagIndex === tagIndex ? { ...tag, value } : tag
          ),
        };
      })
    );
  };

  const updateTagChildValue = (
    sectionIndex: number,
    tagIndex: number,
    childIndex: number,
    value: string
  ) => {
    setFtSections((prevSections) =>
      prevSections.map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          tags: (section.tags ?? []).map((tag, currentTagIndex) => {
            if (currentTagIndex !== tagIndex) {
              return tag;
            }

            return {
              ...tag,
              child_tag: (tag.child_tag ?? []).map((child, currentChildIndex) =>
                currentChildIndex === childIndex ? { ...child, value } : child
              ),
            };
          }),
        };
      })
    );
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


  const addSection = (index: number) => {
    const updatedFtSections = [...ftSections];
    updatedFtSections.splice(index + 1, 0, {
      label: `section${index}`,
      name: `section${index}`,
      insertableOptions: commonInsertableOptions,
      tags: [],
    });

    setFtSections(updatedFtSections);
  };

  const removeSection = function(index: number) {
    const updatedFtSections = [...ftSections];
    updatedFtSections.splice(index, 1);
    setFtSections(updatedFtSections);
  };
      

  useEffect(() => {
    fetchJournalOptions();
  }, []);

  useEffect(() => {
    if (userData?.ID) {
      const loadFullTextData = async () => {
        try {
          setFormLoading(true);
          const response = await axiosInstance.get(`getFulltxtArticleById/${userData.ID}`);
          const fulltextArticles = response?.data?.data || [];
          const selectedArticle = fulltextArticles[0];

          if (selectedArticle?.post_content) {
            try {
              const parsedSections = JSON.parse(selectedArticle.post_content);
              setFtSections(parsedSections);
            } catch {
              setFtSections(initialFtSections);
            }
          }

          setFormData({
            ID: selectedArticle?.ID || '',
            post_title: selectedArticle?.post_title || '',
            post_browser_title: selectedArticle?.post_browser_title || '',
            post_browser_title_slug: selectedArticle?.post_browser_title_slug || '',
            post_meta_keywords: selectedArticle?.post_meta_keywords || '',
            categoryId: selectedArticle?.category_id?.toString() || '',
            journal_id: selectedArticle?.journal_id?.toString() || '',
            submission_date: selectedArticle?.submission_date || '',
            publication_date: selectedArticle?.publication_date || '',
            accepted_date: selectedArticle?.accepted_date || '',
            citation_volume: selectedArticle?.citation_volume || '',
            citation_issue: selectedArticle?.citation_issue || '',
            citation_first_page: selectedArticle?.citation_firstpage || '',
            citation_last_page: selectedArticle?.citation_lastpage || '',
            authors: selectedArticle?.authors || '',
          });
        } catch (error) {
          console.error('Failed to load fulltext data', error);
        } finally {
          setFormLoading(false);
        }
      };

      loadFullTextData();
    }
  }, [userData?.ID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'post_browser_title') {
      setFormData((prev) => ({
        ...prev,
        post_browser_title: value,
        post_browser_title_slug: getUrlSlug(value),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const renderTagInput = (section: FullTextSection, tag: FullTextTag, tagIndex: number, sectionIndex: number) => {
    const childFieldPlaceholder =
      tag.name === 'figure_info_box'
        ? 'Enter Link'
        : tag.name === 'reference_links'
          ? 'Enter Link Text'
          : 'Enter Heading';

    const childFieldName =
      tag.name === 'reference_links'
        ? `markup[${section.name}][${tagIndex}][${tag.name}][link][]`
        : `markup[${section.name}][${tagIndex}][${tag.name}][heading][]`;

    const needsChildField =
      tag.name === 'paragraph_with_inline_heading' ||
      tag.name === 'paragraph_with_block_heading' ||
      tag.name === 'figure_info_box' ||
      tag.name === 'reference_links' ||
      tag.name === 'figure_box';

    if (tag.name === 'article_type') {
      return (
        <input
          type="text"
          className="form-control"
          name={`markup[${section.name}][${tagIndex}][${tag.name}][]`}
          placeholder={tag.placeholder}
          value={tag.value || ''}
          onChange={(e) => updateTagValue(sectionIndex, tagIndex, e.target.value)}
        />
      );
    }

    return (
      <>
        {needsChildField && (
          <div className="mb-2">
            <input
              type="text"
              className="form-control"
              name={childFieldName}
              placeholder={childFieldPlaceholder}
              value={tag.child_tag?.[0]?.value || ''}
              onChange={(e) => updateTagChildValue(sectionIndex, tagIndex, 0, e.target.value)}
            />
          </div>
        )}
        <textarea
          className="form-control"
          name={`markup[${section.name}][${tagIndex}][${tag.name}][]`}
          placeholder={tag.placeholder}
          value={tag.value || ''}
          onChange={(e) => updateTagValue(sectionIndex, tagIndex, e.target.value)}
        />
      </>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    getLoading(true);
    setServerMsg('Saving...');

    try {
      const payload = {
        ...formData,
        json_format: 1,
        post_content: JSON.stringify(ftSections),
      };

      await axiosInstance.post('saveFulltextArticle', payload);
      onConfirm?.(payload);
      setServerMsg('Fulltext article saved successfully!');
    } catch (error: any) {
      console.error('Save failed', error);
      setServerMsg(error?.message || 'Failed to save fulltext article.');
    } finally {
      setFormLoading(false);
      getLoading(false);
    }
  };

  return (
    <div id="main-wrapper" className="container-fluid py-4 position-relative">
      <div className="card shadow-sm mx-auto">
        <div className="card-body p-4 position-relative">
          {isFormBusy && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 2 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <form ref={formRef} onSubmit={handleSubmit} id="journal_archive_form">
            <div className="row mb-3 align-items-center">
              <label htmlFor="post_title" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Fulltext Article name
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_title"
                  name="post_title"
                  className="form-control"
                  value={formData.post_title}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="post_browser_title" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Page title
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_browser_title"
                  name="post_browser_title"
                  className="form-control"
                  value={formData.post_browser_title}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="post_browser_title_slug" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Fulltext Article url slug
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_browser_title_slug"
                  name="post_browser_title_slug"
                  className="form-control"
                  value={formData.post_browser_title_slug}
                  onChange={handleChange}
                />
              </div>
            </div>
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
                  name="journal_id"
                  className="form-select"
                  value={formData.journal_id}
                  onChange={handleChange}
                  required
                  disabled={journalLoading}
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
              <label htmlFor="submission_date" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Submission Date
              </label>
              <div className="col-sm-9">
                <input
                  type="date"
                  id="submission_date"
                  name="submission_date"
                  className="form-control"
                  value={formData.submission_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="publication_date" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Publication Date
              </label>
              <div className="col-sm-9">
                <input
                  type="date"
                  id="publication_date"
                  name="publication_date"
                  className="form-control"
                  value={formData.publication_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="accepted_date" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Accepted Date
              </label>
              <div className="col-sm-9">
                <input
                  type="date"
                  id="accepted_date"
                  name="accepted_date"
                  className="form-control"
                  value={formData.accepted_date}
                  onChange={handleChange}
                />
              </div>
            </div>

             <div className="row mb-3 align-items-center">
              <label htmlFor="citation_volume" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Citation Volume
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="citation_volume"
                  name="citation_volume"
                  className="form-control"
                  value={formData.citation_volume}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="citation_issue" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Citation Issue
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="citation_issue"
                  name="citation_issue"
                  className="form-control"
                  value={formData.citation_issue}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="citation_first_page" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Citation First Page
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="citation_first_page"
                  name="citation_first_page"
                  className="form-control"
                  value={formData.citation_first_page}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="citation_last_page" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Citation Last Page
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="citation_last_page"
                  name="citation_last_page"
                  className="form-control"
                  value={formData.citation_last_page}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="authors" className="col-sm-3 col-form-label text-sm-end fw-semibold">
                Authors
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="authors"
                  name="authors"
                  className="form-control"
                  value={formData.authors}
                  onChange={handleChange}
                />
                <i>Authors Should be in comma separed</i>
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label htmlFor="fulltextDescription" className="col-sm-12 col-form-label fw-semibold">
                Fulltext Description
              </label>
              <div className="col-sm-12">
                <div className="fulltext-section" id="fulltext-section">               
                  {ftSections.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className="ft-section-wrap row"
                    >
                      <div
                        className="ft-section-box col-sm-11"
                        id={`ft-section-${section.name}`}
                      >
                        <div className="section-title">
                          <input
                            type="text"
                            name="section.label"
                            value={section.label}
                            onChange={(e) =>
                              handleSectionLabelChange(sectionIndex, e.target.value)
                            }
                          />

                          {section.insertableOptions?.map((option, optionIndex) => (
                            <span
                              key={optionIndex}
                              className="insertable-option"
                              onClick={() =>
                                addInsertableOption(option.name, section.name)
                              }
                            >
                              {option.label || option.placeholder || formatInsertableOptionText(option.name)}
                            </span>
                          ))}                          
                        </div>
                        <div className="ft-tags-box">
                          {section.tags?.map((tag, tagIndex) => (
                            <div style={{ marginBottom: '1rem' }} key={`${section.name}-${tag.name}-${tagIndex}`} className={`form-group row ${tag.name}_box`}>
                              {tag.label_show && (
                                <label htmlFor={tag.name} className="col-sm-12 control-label">
                                  {tag.label}
                                </label>
                              )}

                              <div className="col-sm-11">
                                {renderTagInput(section, tag, tagIndex, sectionIndex)}
                              </div>

                              {tag.name !== 'article_type' && (
                                <div className="col-sm-1 pad0">
                                  <div className="dropdown">
                                    <i
                                      className="bi bi-plus-lg"
                                      data-bs-toggle="dropdown"
                                      aria-hidden="true"
                                      style={{ cursor: 'pointer' }}
                                    />

                                    <i
                                      className="bi bi-dash-lg ms-2"
                                      aria-hidden="true"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => removeInsertableOption(section.label, tagIndex)}
                                    />

                                    <ul className="dropdown-menu dropdown-menu-end">
                                      {copyInsertableOptions.map((option) => (
                                        <li
                                          key={option.name}
                                          onClick={() =>
                                            addInsertableOption(option.name, section.name, sectionIndex)
                                          }
                                        >
                                          <button type="button" className="dropdown-item">
                                            {option.label || option.placeholder || formatInsertableOptionText(option.name)}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-sm-1">                     
                        <div className="align-items-center section-icon plus" role="button" onClick={() => addSection(sectionIndex)}>
                          <i className="bi bi-plus-lg" aria-hidden="true"></i>
                        </div>

                        {sectionIndex !== 0 && (
                          <div className="align-items-center section-icon minus" role="button" onClick={() => removeSection(sectionIndex)}>
                            <i className="bi bi-dash-lg" aria-hidden="true"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}  
                </div>
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

export default CreateFullTextForm;
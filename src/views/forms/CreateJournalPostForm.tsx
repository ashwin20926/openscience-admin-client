import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import axiosInstance from "../../auth/axiosInstance";

import { Editor } from "@tinymce/tinymce-react";
import tinymce from "tinymce/tinymce";

(window as any).tinymce = tinymce;

import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom/model";

import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/oxide/content.min.css";

import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";

type CreateJournalArchiveHandle = {
  requestSubmit: () => void;
};

interface CreateJournalPostProps {
  onConfirm: (data: CreateJournalPostFormData) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

interface CreateJournalPostFormData {
  post_name: string;
  post_slug: string;
  journal_slug: string;
  category_id: string;
  journal_id: string;
  post_content: string;
  post_title_tag: string;
  post_keywords: string;
  post_meta_description: string;
  id?: string | number | null;
}

const CreateJournalPostForm = forwardRef<
  CreateJournalArchiveHandle,
  CreateJournalPostProps
>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalGroups, setJournalGroups] = useState<Array<{ categoryName: string; journals: Array<{ id: string | number; label: string }> }>>([]);
  
  const [formData, setFormData] = useState<CreateJournalPostFormData>({
    post_name: "",
    post_slug: "",
    journal_slug: "",
    category_id: "",
    journal_id: "",
    post_content: "",
    post_title_tag: "",
    post_keywords: "",
    post_meta_description: "",
    id: null,
  });

  const [serverMsg, setServerMsg] = useState("");
  const [, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => {
      formRef.current?.requestSubmit();
    },
  }));

  const categories = [
    { id: "10", name: "Medical" },
    { id: "20", name: "Biotechnology" },
    { id: "30", name: "Biology" },
    { id: "40", name: "Pharmaceutical" },
  ];

  /*
   * TinyMCE change handler
   */
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      post_content: content,
    }));
  };

  /*
   * Load existing journal data when editing
   */
  useEffect(() => {
    const loadJournalPosts = async () => {
      console.log(userData)
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);

        const response = await axiosInstance.get(
          `getJournalPostsById/${userData.id}`,
        );

        console.log(response);

        const journal = response?.data?.data;

        if (!journal) {
          return;
        }

        setFormData({
          id: journal.id ?? null,
          post_name: journal.post_name?.toString() || "",
          post_slug: journal.post_slug?.toString() || "",
          journal_slug: journal.journal_slug?.toString() || "",
          category_id: journal.category_id?.toString() || "",
          journal_id: journal.journal_id?.toString() || "",
          post_content: journal.post_content?.toString() || "",
          post_title_tag: journal.post_title_tag?.toString() || "",
          post_keywords: journal.post_keywords?.toString() || "",
          post_meta_description: journal.post_meta_description?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to load Journal", error);

        setServerMsg("Failed to load journal data.");
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadJournalPosts();
  }, [userData?.id, getLoading]);

  
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
  /*
   * Normal input/select change handler
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Submit journal
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    getLoading(true);
    setServerMsg("Saving...");
    try {
      /*
       * Payload matches the journal form fields
       */
      const payload = {
        id: formData.id ?? undefined,
        post_name: formData.post_name || "",
        post_slug: formData.post_slug || "",
        category_id: formData.category_id || "",
        journal_id: formData.journal_id || "",
        post_content: formData.post_content || "",
        post_title_tag: formData.post_title_tag || "",
        post_keywords: formData.post_keywords || "",
        post_meta_description: formData.post_meta_description || "",
      };

      console.log("Journal Payload:", payload);

      const response = await axiosInstance.post("addOrUpdateJournalPost", payload);

      const msg = response?.data?.message || "Journal post saved successfully!";

      setServerMsg(msg);

      /*
       * Return the submitted data to parent
       */
      onConfirm?.(formData);
    } catch (error: any) {
      console.error("Save Journal failed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save journal.";

      setServerMsg(errorMessage);
    } finally {
      setLoading(false);
      getLoading(false);
    }
  };

  return (
    <div id="main-wrapper" className="container-fluid py-4">
      <div className="card shadow-sm mx-auto">
        <div className="card-body p-4">
          <form ref={formRef} onSubmit={handleSubmit} id="journal_form">
            
            {/* Journal Name */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="post_name"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Name
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_name"
                  name="post_name"
                  className="form-control"
                  required
                  value={formData.post_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Journal URL Slug */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="post_slug"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Slug
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="post_slug"
                  name="post_slug"
                  className="form-control"
                  value={formData.post_slug}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Main Category */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="category_id"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Main Category Name
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
            {/* Post Content */}
            <div className="row mb-3">
              <label
                htmlFor="post_content"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Content
              </label>

              <div className="col-sm-9">
                <Editor
                  licenseKey="gpl"
                  value={formData.post_content}
                  init={{
                    height: 300,
                    menubar: false,

                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                    ],

                    toolbar:
                      "undo redo | bold italic | " +
                      "alignleft aligncenter alignright alignjustify | " +
                      "bullist numlist outdent indent | " +
                      "link image",

                    skin: "oxide",
                    content_css: "default",
                  }}
                  onEditorChange={handleEditorChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label
                htmlFor="post_title_tag"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Title Tag
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_title_tag"
                  name="post_title_tag"
                  className="form-control"
                  required
                  value={formData.post_title_tag}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <label
                htmlFor="post_keywords"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Keywords
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="post_keywords"
                  name="post_keywords"
                  className="form-control"
                  required
                  value={formData.post_keywords}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="post_meta_description"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Post Meta Description
              </label>

              <div className="col-sm-9">
                <textarea
                  id="post_meta_description"
                  name="post_meta_description"
                  className="form-control"
                  required
                  value={formData.post_meta_description}
                  onChange={handleChange}
                />
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

CreateJournalPostForm.displayName = "CreateJournalPostForm";

export default CreateJournalPostForm;

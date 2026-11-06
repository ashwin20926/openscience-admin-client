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

interface CreateLatestArticleProps {
  onConfirm: (data: CreateJournalFormData) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

interface CreateJournalFormData {
  journal_url_slug: string;
  journal_name: string;
  issn_number: string;
  impact_factor: string;
  impact_factor_equation: string;
  journal_meta_keywords: string;
  journal_ic_value: string;
  main_category_id: string | null;
  journal_description: string;
  banner_image: string;
  sidebar_image: string;
  id?: string | number | null;
}

const CreateJournalForm = forwardRef<
  CreateJournalArchiveHandle,
  CreateLatestArticleProps
>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formData, setFormData] = useState<CreateJournalFormData>({
    journal_url_slug: "",
    journal_name: "",
    issn_number: "",
    impact_factor: "",
    impact_factor_equation: "",
    journal_meta_keywords: "",
    journal_ic_value: "",
    main_category_id: null,
    journal_description: "",
    banner_image: "",
    sidebar_image: "",
    id: null,
  });

  const [serverMsg, setServerMsg] = useState("");
  const [, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    requestSubmit: () => {
      formRef.current?.requestSubmit();
    },
  }));

  /*
   * TinyMCE change handler
   */
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      impact_factor_equation: content,
    }));
  };

  /*
   * Load existing journal data when editing
   */
  useEffect(() => {
    const loadJournalData = async () => {
      console.log(userData)
      if (!userData?.id) return;

      try {
        setLoading(true);
        getLoading(true);

        const response = await axiosInstance.get(
          `getJournalById/${userData.id}`,
        );

        const journal = response?.data?.data?.[0];

        if (!journal) {
          return;
        }

        setFormData({
          id: journal.id ?? null,

          journal_url_slug: journal.journal_url_slug?.toString() || "",

          journal_name: journal.journal_name?.toString() || "",

          issn_number: journal.issn_number?.toString() || "",

          impact_factor: journal.impact_factor?.toString() || "",

          impact_factor_equation:
            journal.impact_factor_equation?.toString() || "",

          journal_meta_keywords:
            journal.journal_meta_keywords?.toString() || "",

          journal_ic_value: journal.journal_ic_value?.toString() || "",

          main_category_id: journal.main_category_id?.toString() || null,

          journal_description: journal.journal_description?.toString() || "",

          banner_image: journal.banner_image?.toString() || "",

          sidebar_image: journal.sidebar_image?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to load Journal", error);

        setServerMsg("Failed to load journal data.");
      } finally {
        setLoading(false);
        getLoading(false);
      }
    };

    loadJournalData();
  }, [userData?.id, getLoading]);

  /*
   * Normal input/select change handler
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

        journal_url_slug: formData.journal_url_slug || "",

        journal_name: formData.journal_name || "",

        issn_number: formData.issn_number || "",

        impact_factor: formData.impact_factor || "",

        impact_factor_equation: formData.impact_factor_equation || "",

        journal_meta_keywords: formData.journal_meta_keywords || "",

        journal_ic_value: formData.journal_ic_value || "",

        main_category_id: formData.main_category_id,

        journal_description: formData.journal_description || "",

        banner_image: formData.banner_image || "",

        sidebar_image: formData.sidebar_image || "",
      };

      console.log("Journal Payload:", payload);

      const response = await axiosInstance.post("addOrUpdateJournal", payload);

      const msg = response?.data?.message || "Journal saved successfully!";

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
                htmlFor="journal_name"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Name
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="journal_name"
                  name="journal_name"
                  className="form-control"
                  required
                  value={formData.journal_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Journal URL Slug */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_url_slug"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal URL Slug
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="journal_url_slug"
                  name="journal_url_slug"
                  className="form-control"
                  value={formData.journal_url_slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ISSN Number */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="issn_number"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                ISSN Number
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="issn_number"
                  name="issn_number"
                  className="form-control"
                  value={formData.issn_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Impact Factor */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="impact_factor"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Impact Factor Value
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="impact_factor"
                  name="impact_factor"
                  className="form-control"
                  value={formData.impact_factor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Impact Factor Equation */}
            <div className="row mb-3">
              <label
                htmlFor="impact_factor_equation"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Impact Factor Equation
              </label>

              <div className="col-sm-9">
                <Editor
                  licenseKey="gpl"
                  value={formData.impact_factor_equation}
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

            {/* Journal Meta Keywords */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_meta_keywords"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Meta Keywords
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="journal_meta_keywords"
                  name="journal_meta_keywords"
                  className="form-control"
                  value={formData.journal_meta_keywords}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Journal IC Value */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_ic_value"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal IC Value
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="journal_ic_value"
                  name="journal_ic_value"
                  className="form-control"
                  value={formData.journal_ic_value}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Journal Description */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_description"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Description
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  id="journal_description"
                  name="journal_description"
                  className="form-control"
                  value={formData.journal_description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Banner Image */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="banner_image"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Banner Image
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="banner_image"
                  name="banner_image"
                  className="form-control"
                  value={formData.banner_image}
                  onChange={handleChange}
                  placeholder="Enter banner image URL"
                />
              </div>
            </div>

            {/* Sidebar Image */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="sidebar_image"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Sidebar Image
              </label>

              <div className="col-sm-9">
                <input
                  type="text"
                  required
                  id="sidebar_image"
                  name="sidebar_image"
                  className="form-control"
                  value={formData.sidebar_image}
                  onChange={handleChange}
                  placeholder="Enter sidebar image URL"
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

CreateJournalForm.displayName = "CreateJournalForm";

export default CreateJournalForm;

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import axiosInstance from "../../auth/axiosInstance";

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
  created_date: string;
  updated_date: string;
  journal_meta_keywords: string;
  main_category_id: string;
  journal_description: string;
  banner_image: string;
  sidebar_image: string;
  journal_image: File | string | null;
  deleted: string;
  id?: string | number | null;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const CreateJournalForm = forwardRef<
  CreateJournalArchiveHandle,
  CreateLatestArticleProps
>(({ onConfirm, getLoading, userData }, ref) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formData, setFormData] = useState<CreateJournalFormData>({
    journal_url_slug: "",
    journal_name: "",
    issn_number: "",
    created_date: getToday(),
    updated_date: getToday(),
    journal_meta_keywords: "",
    main_category_id: "0",
    journal_description: "",
    banner_image: "",
    sidebar_image: "",
    journal_image: "",
    deleted: "1",
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
   * Load existing journal data when editing
   */
  useEffect(() => {
    const loadJournalData = async () => {
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
          created_date: journal.created_date?.toString() || getToday(),
          updated_date: journal.updated_date?.toString() || getToday(),
          journal_meta_keywords:
            journal.journal_meta_keywords?.toString() || "",
          main_category_id: journal.main_category_id?.toString() || "0",
          journal_description: journal.journal_description?.toString() || "",
          banner_image: journal.banner_image?.toString() || "",
          sidebar_image: journal.sidebar_image?.toString() || "",
          journal_image: journal.journal_image?.toString() || "",
          deleted: journal.deleted?.toString() || "1",
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

  const handleJournalImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      journal_image: e.target.files?.[0] ?? prev.journal_image,
    }));
  };

  const getFilename = (value: File | string | null) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.replace(/\\/g, "/").split("/").pop() || "";
  };

  const uploadJournalImage = async () => {
    if (!(formData.journal_image instanceof File)) {
      return getFilename(formData.journal_image);
    }

    const formDataUpload = new FormData();
    formDataUpload.append("journal_image", formData.journal_image);
    const response = await axiosInstance.post("upload-files", formDataUpload);
    const filename = response?.data?.file_data?.upload_data?.file_name;

    if (typeof filename !== "string" || !filename) {
      throw new Error("Journal image upload did not return a filename.");
    }

    return filename;
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
      const journalImage = await uploadJournalImage();
      const updatedDate = getToday();
      const payload = {
        id: formData.id ?? null,
        issn_number: formData.issn_number || "",
        created_date: formData.created_date || updatedDate,
        updated_date: updatedDate,
        journal_name: formData.journal_name || "",
        journal_url_slug: formData.journal_url_slug || "",
        main_category_id: formData.main_category_id || "0",
        journal_meta_keywords: formData.journal_meta_keywords || "",
        banner_image: formData.banner_image || "",
        sidebar_image: formData.sidebar_image || "",
        journal_image: journalImage,
        journal_description: formData.journal_description || "",
        deleted: formData.deleted || "1",
      };
      const updatedFormData = {
        ...formData,
        journal_image: journalImage,
        updated_date: updatedDate,
      };

      console.log("Journal Payload:", payload);

      const response = await axiosInstance.post("addOrUpdateJournal", payload);

      const msg = response?.data?.message || "Journal saved successfully!";

      setServerMsg(msg);

      setFormData(updatedFormData);
      onConfirm?.(payload);
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

            {/* Journal Slug */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_url_slug"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal slug
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

            {/* Journal ISSN Number */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="issn_number"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal ISSN Number
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
                        {/* Journal Image */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="journal_image"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal Image
              </label>

              <div className="col-sm-9">
                <input
                  type="file"
                  id="journal_image"
                  className="form-control"
                  accept="image/png,image/jpeg,image/gif"
                  required={!formData.journal_image}
                  onChange={handleJournalImageChange}
                />
                {formData.journal_image && (
                  <div className="mt-2 text-muted">
                    {formData.journal_image instanceof File
                      ? formData.journal_image.name
                      : getFilename(formData.journal_image)}
                  </div>
                )}
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

            {/* Journal Banner Image */}
            <div className="row mb-3 align-items-center">
              <label
                htmlFor="banner_image"
                className="col-sm-3 col-form-label text-sm-end fw-semibold"
              >
                Journal banner Image
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

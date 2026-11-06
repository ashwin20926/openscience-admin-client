import { useRef, useState, useEffect } from "react";
import axiosInstance from "../auth/axiosInstance";
import CustomAgGrid from "../common/CustomAgGrid";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const UploadFilesToServer = () => {
  const [searchData, setSearchData] = useState("");
  const [fulltextData, setFullTextData] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploadLocation, setUploadLocation] = useState("wp-content");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const pageSize = 15;

  const [totalCount, setTotalCount] = useState(0);

  const [columnDefs] = useState([
    {
      headerName: "File Name",
      field: "file_name",
      width: 260,
      wrapText: true,
      autoHeight: true,
    },
    {
      headerName: "Full Path",
      field: "full_path",
      width: 500,
    },
    {
      headerName: "Image Type",
      field: "image_type",
      width: 120,
    },
    {
      headerName: "File Extension",
      field: "file_ext",
      width: 120,
    },
    {
      headerName: "Created Date",
      field: "created_date",
      width: 200,
    },
  ]);

  useEffect(() => {
    fetchUploadFilesToServer();
  }, []);

  const fetchUploadFilesToServer = async () => {
    setLoadingState(true);

    try {
      const response = await axiosInstance.get("getUploadedFiles");

      const data = response?.data?.data || [];
      const count = response?.data?.totalCount || data.length;

      setFullTextData(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to fetch uploaded files", error);
    } finally {
      setLoadingState(false);
    }
  };

  /**
   * Upload one file using Axios.
   *
   * Axios automatically gets the auth token from axiosInstance
   * if your axiosInstance has an Authorization interceptor.
   */
  const uploadFileToServer = async (uploadFile: UploadFile) => {
    const formData = new FormData();

    formData.append("file", uploadFile.file);
    formData.append("targetLocation", uploadLocation);

    // Set file status to uploading
    setUploadFiles((prev) =>
      prev.map((item) =>
        item.id === uploadFile.id
          ? {
              ...item,
              status: "uploading",
              progress: 0,
            }
          : item,
      ),
    );

    try {
      await axiosInstance.post("upload-files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setUploadFiles((prev) =>
            prev.map((item) =>
              item.id === uploadFile.id
                ? {
                    ...item,
                    progress: percentage,
                  }
                : item,
            ),
          );
        },
      });

      // Upload successful
      setUploadFiles((prev) =>
        prev.map((item) =>
          item.id === uploadFile.id
            ? {
                ...item,
                progress: 100,
                status: "success",
              }
            : item,
        ),
      );

      return true;
    } catch (error: any) {
      console.error(`Failed to upload ${uploadFile.file.name}`, error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Upload failed.";

      setUploadFiles((prev) =>
        prev.map((item) =>
          item.id === uploadFile.id
            ? {
                ...item,
                status: "error",
                error: message,
              }
            : item,
        ),
      );

      return false;
    }
  };

  /**
   * Upload multiple files simultaneously.
   */
  const uploadMultipleFiles = async (files: File[]) => {
    if (!files.length) return;

    const validFiles: UploadFile[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`${file.name} is too large.`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        progress: 0,
        status: "pending",
      });
    });

    if (!validFiles.length) return;

    // Add files to UI
    setUploadFiles(validFiles);

    /**
     * Promise.all uploads all files simultaneously.
     *
     * If you have many files and don't want to overload the server,
     * you can change this to a concurrency-limited implementation.
     */
    await Promise.all(
      validFiles.map((uploadFile) => uploadFileToServer(uploadFile)),
    );

    // Refresh grid after uploads finish
    await fetchUploadFilesToServer();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    uploadMultipleFiles(selectedFiles);

    // Allow selecting the same files again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const selectedFiles = Array.from(e.dataTransfer.files || []);

    uploadMultipleFiles(selectedFiles);
  };

  const onFilterTextBoxChanged = (event: any) => {
    setSearchData(event.target.value);
  };

  const isUploading = uploadFiles.some(
    (file) => file.status === "uploading" || file.status === "pending",
  );

  return (
    <>
      <div className="page">
        <div className="page-header">
          <h1>Upload Files</h1>
        </div>

        <div className="search-input">
          <input
            type="text"
            name="avens-grid-search"
            className="avens-grid-search form-control"
            placeholder="Search"
            onKeyUp={onFilterTextBoxChanged}
          />
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {/* Upload Section */}
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto 10px",
              fontFamily: "sans-serif",
            }}
          >
            {/* Location Selector */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Select Upload Destination:
              </label>

              <select
                value={uploadLocation}
                onChange={(e) => setUploadLocation(e.target.value)}
                disabled={isUploading}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="wp-content">Standard (Wp-content)</option>

                <option value="fulltext-wp-content">
                  Fulltext (Fulltext Wp-content)
                </option>
              </select>
            </div>

            {/* Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              style={{
                border: "2px dashed #0070f3",
                borderRadius: "8px",
                padding: "40px 20px",
                textAlign: "center",
                cursor: isUploading ? "not-allowed" : "pointer",
                background: isUploading ? "#f0f0f0" : "#f9f9f9",
                opacity: isUploading ? 0.6 : 1,
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                multiple
                style={{ display: "none" }}
              />

              <p style={{ margin: 0 }}>
                {isUploading
                  ? "Uploading files..."
                  : "Drop files here or click to upload"}
              </p>

              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                Multiple files are supported.
              </span>

              <br />

              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                Target:{" "}
                <strong>
                  {uploadLocation === "wp-content"
                    ? "Wp-content"
                    : "Fulltext Wp-content"}
                </strong>
              </span>
            </div>

            {/* Upload Progress */}
            {/* Upload Progress */}
            {uploadFiles.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    style={{
                      marginBottom: "15px",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      position: "relative",
                    }}
                  >
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        // Don't allow closing while uploading
                        if (uploadFile.status === "uploading") {
                          return;
                        }

                        setUploadFiles((prev) =>
                          prev.filter((item) => item.id !== uploadFile.id),
                        );
                      }}
                      disabled={uploadFile.status === "uploading"}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "8px",
                        border: "none",
                        background: "transparent",
                        color:
                          uploadFile.status === "uploading"
                            ? "#aaa"
                            : "#dc3545",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor:
                          uploadFile.status === "uploading"
                            ? "not-allowed"
                            : "pointer",
                        padding: "2px 6px",
                        lineHeight: 1,
                      }}
                      title={
                        uploadFile.status === "uploading"
                          ? "Upload in progress"
                          : "Remove"
                      }
                    >
                      ×
                    </button>

                    {/* File name + status */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingRight: "25px",
                        marginBottom: "6px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "70%",
                        }}
                      >
                        {uploadFile.file.name}
                      </strong>

                      <span
                        style={{
                          fontSize: "12px",
                          color:
                            uploadFile.status === "success"
                              ? "green"
                              : uploadFile.status === "error"
                                ? "red"
                                : "#666",
                        }}
                      >
                        {uploadFile.status === "pending" && "Waiting..."}

                        {uploadFile.status === "uploading" &&
                          `${uploadFile.progress}%`}

                        {uploadFile.status === "success" && "✓ Uploaded"}

                        {uploadFile.status === "error" && "✕ Failed"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "4px",
                        height: "8px",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background:
                            uploadFile.status === "error"
                              ? "#dc3545"
                              : uploadFile.status === "success"
                                ? "#28a745"
                                : "#0070f3",
                          height: "100%",
                          width: `${uploadFile.progress}%`,
                          transition: "width 0.2s ease",
                        }}
                      />
                    </div>

                    {/* Error */}
                    {uploadFile.error && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          margin: "5px 0 0",
                        }}
                      >
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="table-data upload-files-table">
            <CustomAgGrid
              loadingState={loadingState}
              columnDefs={columnDefs}
              searchData={searchData}
              rowData={fulltextData}
              enableDelete={false}
              pagination={true}
              paginationPageSize={pageSize}
              totalCount={totalCount}
              noActionColumn={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadFilesToServer;

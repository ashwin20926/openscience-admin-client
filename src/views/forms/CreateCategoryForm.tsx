import React, { forwardRef, useRef, useImperativeHandle } from "react";

interface CreateCategoryFormProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
}

type CreateCategoryFormHandle = {
  requestSubmit: () => void;
};

const CreateCategoryForm = forwardRef<CreateCategoryFormHandle, CreateCategoryFormProps>(
({ onConfirm, getLoading }, ref) => {
    const formRef = useRef<HTMLFormElement | null>(null);

    useImperativeHandle(ref, () => ({
      requestSubmit: () => formRef.current?.requestSubmit()
    }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      getLoading(true);

      getLoading(false);
      onConfirm({data});
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit} >
        <div className="mb-3">
          <label className="form-label">Category Name</label>
          <input type="text" required name="category" className="form-control" />
        </div>
      </form>
    );
  }
);

export default CreateCategoryForm;

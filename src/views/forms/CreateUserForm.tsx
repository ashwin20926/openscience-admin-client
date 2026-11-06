import React, { forwardRef, useRef, useImperativeHandle, useState } from "react";
import axiosInstance from "../../auth/axiosInstance";
import { useAuthContext } from "../../auth/AuthContext";

interface CreateUserFormProps {
  onConfirm: (data: any) => void;
  getLoading: (loading: boolean) => void;
  userData?: any;
}

type CreateUserFormHandle = {
  requestSubmit: () => void;
};

const CreateUserForm = forwardRef<CreateUserFormHandle, CreateUserFormProps>(
  ({ onConfirm, getLoading, userData }, ref) => {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [changePassword, setChangePassword] = useState(false);
    const isEditing = userData?.id;
    const authContext = useAuthContext();
    const { user: authUser } = authContext || {};
    const updateUser = authContext?.updateUser;
    const isAdmin = authUser?.roleName === "Admin";

    useImperativeHandle(ref, () => ({
      requestSubmit: () => formRef.current?.requestSubmit()
    }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      getLoading(true);

      try {
        if (isEditing) {
          // Update existing user
          const updateData: any = { name: data.name, email: data.email };
          if (changePassword && data.password) {
            updateData.password = data.password;
          }
          if (isAdmin) {
            updateData.status = data.status ? 1 : 2;
          }
          await axiosInstance.put(`updateUser/${userData.id}`, updateData);
          updateUser?.({ name: data.name, email: data.email }); // Update context with new user data  
        } else {
          // Create new user
          await axiosInstance.post('createUser', { 
            name: data.name, 
            email: data.email, 
            password: data.password,
            role: data.role 
          });
        }
        getLoading(false);
        onConfirm({ data });
      } catch (error) {
        getLoading(false);
        console.error('Error:', error);
      }
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit} >
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" required name="name" className="form-control" defaultValue={userData?.name || ""} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" required name="email" className="form-control" defaultValue={userData?.email || ""} />
        </div>

        {isEditing ? (
          <div className="mb-3">
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="changePassword">
                Change Password
              </label>
            </div>
            {changePassword && (
              <div className="mt-2">
                <label className="form-label">New Password</label>
                <input type="password" name="password" className="form-control" placeholder="Enter new password" />
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" required name="password" className="form-control" placeholder="Enter password" />
          </div>
        )}
        {isEditing && isAdmin && (
          <>
            <div className="mb-3">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="activeStatus"
                  name="status"
                  defaultChecked={userData?.status === 1}
                />
                <label className="form-check-label" htmlFor="activeStatus">
                  Active User
                </label>
              </div>
            </div>
          </>
        )}
      </form>
    );
  }
);

export default CreateUserForm;

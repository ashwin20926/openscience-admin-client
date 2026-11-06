import React, { createContext, useContext, useState, useRef } from 'react';
import CommonModal from './CommonModal'; // Adjust import path as needed

interface ConfirmOptions {
  title?: string;
  body?: React.ReactNode;
  // This allows you to pass an async function that runs while the modal shows a loading spinner
  onDeleteAction: () => Promise<void>;
}

type ConfirmDeleteContextType = (options: ConfirmOptions) => void;

const ConfirmDeleteContext = createContext<ConfirmDeleteContextType | null>(null);

export const ConfirmDeleteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalProps, setModalProps] = useState({ title: '', body: ('' as React.ReactNode) });
  
  // Use a ref to capture the dynamic async function safely
  const actionRef = useRef<(() => Promise<void>) | null>(null);

  const confirmDelete = (options: ConfirmOptions) => {
    setModalProps({
      title: options.title || 'Confirm Delete',
      body: options.body || 'Are you sure you want to permanently delete this item?',
    });
    actionRef.current = options.onDeleteAction;
    setShow(true);
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while processing
    setShow(false);
  };

  const handleConfirm = async () => {
    if (!actionRef.current) return;
    
    try {
      setLoading(true);
      await actionRef.current(); // Execute the actual API call
      setShow(false);            // Close only if the API call succeeds
    } catch (error) {
      console.error("Deletion failed:", error);
      // Keep modal open so user can see it failed or try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDeleteContext.Provider value={confirmDelete}>
      {children}      
      <CommonModal
        show={show}
        title={modalProps.title}
        body={modalProps.body}
        onClose={handleClose}
        onConfirm={handleConfirm}
        loading={loading}
        confirmButonText="Delete"
        backdrop="static" // Keep it fixed during destructive deletions
      />
    </ConfirmDeleteContext.Provider>
  );
};

export const useConfirmDelete = () => {
  const context = useContext(ConfirmDeleteContext);
  if (!context) {
    throw new Error('useConfirmDelete must be used within a ConfirmDeleteProvider');
  }
  return context;
};

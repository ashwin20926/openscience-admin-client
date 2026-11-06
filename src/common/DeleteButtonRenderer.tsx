import { Trash } from 'lucide-react';

const DeleteButtonRenderer = (props: any) => {
  const handleClick = () => {
    props.onDelete?.(props.data);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      title="Delete"
    >
      <Trash size={16} color="red" />
    </button>
  );
};

export default DeleteButtonRenderer;
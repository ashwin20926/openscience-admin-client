import { Pencil } from 'lucide-react';

const EditButtonRenderer = (props: any) => {
  const handleClick = () => {
    //alert(`Edit row ID: ${props.data.id}`);
    props.onEdit(props.data)
  };

  return (
    <button onClick={handleClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <Pencil size={16} color="blue" />
    </button>
  );
};

export default EditButtonRenderer; 
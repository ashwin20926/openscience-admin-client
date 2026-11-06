const ReadStatusButtonRenderer = (props: any) => {
  const value = props.value;
  const label = value === 2 ? 'Unread' : value === 1 ? 'Read' : 'Unknown';
  const buttonClass =
    value === 2
      ? 'btn btn-sm btn-danger'
      : value === 1
        ? 'btn btn-sm btn-success'
        : 'btn btn-sm btn-secondary';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    props.onUpdate?.(props.data, value === 2 ? 1 : 2);
  };

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {label}
    </button>
  );
};

export default ReadStatusButtonRenderer;
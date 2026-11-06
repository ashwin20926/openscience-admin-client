import { useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import EditButtonRenderer from "./EditButtonRenderer";
import DeleteButtonRenderer from "./DeleteButtonRenderer";
import moment from 'moment';

const CustomAgGrid = (props: any) => {
  const columnDefs = [
    ...props.columnDefs.map((columnDef: any) => {
      if (!['created_date', 'updated_date'].includes(columnDef.field)) {
        return columnDef;
      }

      return {
        ...columnDef,
        cellRenderer: (params: any) => {
          if (!params.value) return '';

          const date = moment(params.value);
          return date.isValid()
            ? date.format('MM/DD/YYYY')
            : params.value;
        },
      };
    }),
    {
      headerName: "Action",
      field: "edit",
      cellRenderer: EditButtonRenderer,
      width: 100,
      cellRendererParams: {
        onEdit: props.onEdit,
      },
    },
  ];

  if (props.noActionColumn) {
    columnDefs.pop();
  }

  if (props.enableDelete) {
    columnDefs.push({
      headerName: "Delete",
      field: "delete",
      cellRenderer: DeleteButtonRenderer,
      width: 100,
      cellRendererParams: {
        onDelete: props.onDelete,
      },
    });
  }

  const gridRef = useRef<AgGridReact>(null);
  const isServerSidePagination = props.rowModelType === "serverSide";

  useEffect(() => {
    gridRef.current?.api?.setGridOption(
      "quickFilterText", props.searchData
    );
  }, [props.searchData]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        enableCellTextSelection={true}
        ensureDomOrder={true}       
        loading={props.loadingState}
        rowData={isServerSidePagination ? undefined : props.rowData}
        columnDefs={columnDefs}
        pagination={props.pagination ?? false}
        paginationPageSize={props.paginationPageSize ?? 10}
        cacheBlockSize={props.cacheBlockSize ?? props.paginationPageSize ?? 10}
        suppressPaginationPanel={props.suppressPaginationPanel ?? false}
        rowModelType={props.rowModelType}
        serverSideDatasource={props.serverSideDatasource}
        onGridReady={props.onGridReady}
        onPaginationChanged={(event) => {
          if (isServerSidePagination) {
            return;
          }

          const pageNumber = event.api.paginationGetCurrentPage() + 1;
          props.onPaginationChanged?.(pageNumber);
        }}
      />
    </div>
  );
};

export default CustomAgGrid;

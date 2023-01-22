import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtual } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "@mui/material";
import { DefaultApi as Api } from "../client";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { filterModalVisibleAtom, filtersAtom } from "../recoil/atoms";
import {
  filteredEventsState,
  filtersToQueryParamsState,
} from "../recoil/selectors";
import {
  faEye,
  faEyeSlash,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";

export default function Table({ filteredEvents }) {
  const filtersToQueryParams = useRecoilValue(filtersToQueryParamsState);
  const filters = useRecoilValue(filtersAtom);
  const filterModalVisible = useRecoilValue(filterModalVisibleAtom);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([{ id: "event_id", asc: true }]);
  const [data, setData] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "event_id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "area",
        header: "Area",
      },
      {
        accessorKey: "severity_index",
        header: "SI",
      },
      {
        accessorKey: "start_time",
        header: "Start",
        cell: (info) => dayjs.unix(info.getValue()).format("DD.MM.YYYY HH:mm"),
      },
      {
        accessorKey: "length",
        header: "Length",
        cell: (info) => info.getValue() + "h",
        size: 70,
      },
      {
        accessorKey: "meanLat",
        header: "Mean Lat.",
        size: 100,
      },
      {
        accessorKey: "meanLon",
        header: "Mean Lon.",
        size: 100,
      },
      {
        accessorKey: "meanPrec",
        header: "Mean Prec.",
        size: 100,
      },
      {
        accessorKey: "maxPrec",
        header: "Max Prec.",
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    defaultColumn: {
      sortDescFirst: false,
    },
  });

  const tableContainerRef = useRef(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 10,
  });
  const { virtualItems: virtualRows } = rowVirtualizer;
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;

  useEffect(() => {
    if (!filterModalVisible)
      (async () => {
        setLoading(true);
        setData(filteredEvents);
        setLoading(false);
      })();
  }, [filters, filterModalVisible]);

  return (
    <div>
      {loading ? (
        "Loading table..."
      ) : (
        <>
          <div className="d-block overflow-scroll text-nowrap vis-chips-container">
            {table.getAllLeafColumns().map((column) => {
              return (
                <span key={column.id}>
                  <Chip
                    label={
                      <span>
                        {column.columnDef.header}{" "}
                        <FontAwesomeIcon
                          icon={column.getIsVisible() ? faEye : faEyeSlash}
                          color={"#aaa"}
                          size="xs"
                        />
                      </span>
                    }
                    variant={column.getIsVisible() ? "outlined" : undefined}
                    onClick={column.getToggleVisibilityHandler()}
                  />
                  &nbsp;
                </span>
              );
            })}
          </div>

          <div ref={tableContainerRef} className="container p-0">
            <table>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: "user-select-none",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                              role="button"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <>
                                    &nbsp;
                                    <FontAwesomeIcon icon={faCaretUp} />
                                  </>
                                ),
                                desc: (
                                  <>
                                    &nbsp;
                                    <FontAwesomeIcon icon={faCaretDown} />
                                  </>
                                ),
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          )}
                          <div
                            {...{
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className: `resizer ${
                                header.column.getIsResizing()
                                  ? "isResizing"
                                  : ""
                              }`,
                            }}
                          />
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

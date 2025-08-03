'use client';

import { User } from '@supabase/supabase-js';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import Loading from '@/app/dashboard/records/_components/loading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FilterInput from '@/features/attendance/records/components/filter-input';
import MultiSelectDeleteButton from '@/features/attendance/records/components/multi-select-delete-button';
import PageSelectorInput from '@/features/attendance/records/components/page-selector-input';
import { RowMenuAdmin, RowMenuUser, setRemarkColor } from '@/features/attendance/records/components/row-menu';
import TableCellViewer from '@/features/attendance/records/components/table-cell-viewer';
import { useAttendanceRecords, usePrefetchNextPage } from '@/features/attendance/records/hooks/use-attendance-records';
import { usePaginationSearchParams } from '@/features/attendance/records/hooks/use-pagination-search-params';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { SortDirection } from '@/lib/types/types';
import { capitalizeFirstLetter, formatTimeForDisplay } from '@/lib/utils';

dayjs.extend(utc);

interface DataTableProps {
  isAdmin: boolean;
  user: User;
}

const getColumns = (isAdmin: boolean): ColumnDef<AttendanceRecord | AttendanceRecordWithUserDetails>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          name="selectAllRecords"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          name={`record-${row.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'work_date',
    header: ({ column }) => {
      return (
        <Button
          variant={'ghost'}
          className="hover:cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue('work_date')}</div>,
  },
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => <TableCellViewer {...row} />,
    enableHiding: false,
  },
  {
    accessorKey: 'employee_id',
    header: 'Employee ID',
    cell: ({ row }) => <div>{row.getValue('employee_id')}</div>,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => <div>{row.getValue('department')}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'work_mode',
    header: 'Work Mode',
    cell: ({ row }) => <div>{capitalizeFirstLetter(row.getValue('work_mode'))}</div>,
  },
  {
    accessorKey: 'clock_in',
    header: 'Clock In',
    cell: ({ row }) => <div>{formatTimeForDisplay(row.getValue('clock_in'))}</div>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'lunch_out',
    header: 'Lunch Out',
    cell: ({ row }) => <div>{formatTimeForDisplay(row.getValue('lunch_out'))}</div>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'lunch_in',
    header: 'Lunch In',
    cell: ({ row }) => <div>{formatTimeForDisplay(row.getValue('lunch_in'))}</div>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'clock_out',
    header: 'Clock Out',
    cell: ({ row }) => <div>{formatTimeForDisplay(row.getValue('clock_out'))}</div>,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
    filterFn: 'includesString',
    cell: ({ row }) => (
      <div>
        {row.getValue('remarks') ? (
          <span className={`${setRemarkColor(row.getValue('remarks'))}`}>{row.getValue('remarks')}</span>
        ) : (
          '-'
        )}
      </div>
    ),
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => <>{isAdmin ? <RowMenuAdmin {...row} /> : <RowMenuUser {...row} />}</>,
    enableColumnFilter: false,
  },
];

export function DataTable({ user, isAdmin }: DataTableProps) {
  const { paginationParams, setPaginationParams, buildSearchString } = usePaginationSearchParams();

  const { data: paginatedData, isLoading } = useAttendanceRecords(user?.user_metadata.employee_id, {
    ...paginationParams,
    sortDirection: paginationParams.sortDirection as SortDirection | undefined,
  });

  usePrefetchNextPage(user?.user_metadata.employee_id, {
    ...paginationParams,
    sortDirection: paginationParams.sortDirection as SortDirection | undefined,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'work_date',
      desc: true,
    },
  ]);

  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>(paginationParams.filters);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // only show if admin
    select: isAdmin,
    full_name: isAdmin,
    department: isAdmin,
    employee_id: isAdmin,
  });

  const columns = React.useMemo(() => getColumns(isAdmin), [isAdmin]);

  const debouncedFilterChange = useDebouncedCallback((key: string, value: string) => {
    setPaginationParams({
      [key]: value,
      page: 1,
    });
  }, 1000);

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting(updater);
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      if (newSorting.length > 0) {
        setPaginationParams({
          sortBy: newSorting[0].id,
          sortDirection: newSorting[0].desc ? 'desc' : 'asc',
          page: 1,
        });
      }
    },
    [setPaginationParams, sorting],
  );

  const handlePageChange = (page: number) => {
    buildSearchString({
      page,
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPaginationParams({
      pageSize,
      page: 1,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...columnFilters, [key]: value };
    setColumnFilters(newFilters);
    debouncedFilterChange(key, value);
  };

  const table = useReactTable({
    data: paginatedData?.data || [],
    columns,
    enableRowSelection: true,
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: paginatedData?.totalPages || 0,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: (paginatedData?.page || 1) - 1,
        pageSize: paginatedData?.pageSize || 10,
      },
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <FilterInput filters={columnFilters} onFilterChange={handleFilterChange} isLoading={isLoading} table={table} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.values(paginationParams.filters).some((value) => value !== '') && (
        <div className={`flex items-center gap-2 overflow-x-auto text-xs ${isLoading && 'opacity-50'}`}>
          {Object.entries(paginationParams.filters).map(([key, value]) => (
            <React.Fragment key={key}>
              {value !== '' && (
                <div className="bg-card flex items-center rounded-sm border pl-2">
                  <p className="whitespace-nowrap">{value}</p>
                  <Button
                    type="button"
                    variant={'ghost'}
                    className="ml-1 size-6 rounded-sm"
                    onClick={() => handleFilterChange(key, '')}
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table className={`${isLoading && 'opacity-50'}`}>
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          {isAdmin && table.getFilteredSelectedRowModel().rows.length > 0 && <MultiSelectDeleteButton {...table} />}
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {isAdmin ? (
              <p>
                {Object.keys(table.getState().rowSelection).length} of {paginatedData?.total} row(s) selected
              </p>
            ) : (
              <p>{paginatedData?.total} row(s) found</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              name="select-rows-per-page"
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PageSelectorInput
            currentPage={paginatedData?.page || 1}
            totalPages={paginatedData?.totalPages || 1}
            onPageChange={handlePageChange}
          />

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              size={'icon'}
              title="First Page"
              className={`hidden lg:flex ${paginatedData?.page === 1 || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={paginatedData?.page === 1 || isLoading}
              tabIndex={paginatedData?.page === 1 || isLoading ? -1 : undefined}
              asChild
            >
              <Link href={buildSearchString({ page: 1 })}>
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              title="Previous Page"
              className={`${paginatedData?.page === 1 || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={paginatedData?.page === 1 || isLoading}
              tabIndex={paginatedData?.page === 1 || isLoading ? -1 : undefined}
              asChild
            >
              <Link href={buildSearchString({ page: (paginatedData?.page || 1) - 1 })}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              title="Next Page"
              className={`${paginatedData?.page === paginatedData?.totalPages || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={paginatedData?.page === paginatedData?.totalPages || isLoading}
              tabIndex={paginatedData?.page === paginatedData?.totalPages || isLoading ? -1 : undefined}
              asChild
            >
              <Link href={buildSearchString({ page: (paginatedData?.page || 1) + 1 })}>
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              title="Last Page"
              className={`hidden lg:flex ${paginatedData?.page === paginatedData?.totalPages || isLoading ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={paginatedData?.page === paginatedData?.totalPages || isLoading}
              tabIndex={paginatedData?.page === paginatedData?.totalPages || isLoading ? -1 : undefined}
              asChild
            >
              <Link href={buildSearchString({ page: paginatedData?.totalPages || 1 })}>
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

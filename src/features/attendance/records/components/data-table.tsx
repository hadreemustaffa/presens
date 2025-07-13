'use client';

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
} from '@tabler/icons-react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table as TableType,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ArrowUpDown, ChevronDown, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  deleteMultipleRecords,
  deleteRecord,
  editRecord,
  editRemarks,
} from '@/features/attendance/records/actions/actions';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { Remarks, WorkMode } from '@/features/shared/model/enums';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActionState } from '@/lib/middleware';
import { capitalizeFirstLetter, formatTimeForDatabase, formatTimeForDisplay } from '@/lib/utils';

dayjs.extend(utc);

export interface DataTableProps {
  isAdmin: boolean;
  data: AttendanceRecord[] | AttendanceRecordWithUserDetails[];
}

function setRemarkColor(remark: Remarks) {
  switch (remark) {
    case Remarks.EmergencyLeave:
      return 'rounded-sm border p-1 bg-red-500/25';
    case Remarks.AMLeave:
      return 'rounded-sm border p-1 bg-blue-500/25';
    case Remarks.PMLeave:
      return 'rounded-sm border p-1 bg-green-500/25';
    default:
      return 'rounded-sm border p-1 bg-accent/25';
  }
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
    accessorKey: 'clock_out',
    header: 'Clock Out',
    cell: ({ row }) => <div>{formatTimeForDisplay(row.getValue('clock_out'))}</div>,
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

export function DataTable({ data, isAdmin }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'work_date',
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [filterBy, setFilterBy] = React.useState('remarks');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // only show if admin
    select: isAdmin,
    full_name: isAdmin,
    department: isAdmin,
    employee_id: isAdmin,
  });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = React.useMemo(() => getColumns(isAdmin), [isAdmin]);

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <div className="flex w-full items-center">
          <Input
            id="remarks-filter"
            type="text"
            placeholder={`Filter ${filterBy.replace('_', ' ')}...`}
            value={(table.getColumn(filterBy)?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn(filterBy)?.setFilterValue(event.target.value)}
            className="max-w-sm rounded-tr-none rounded-br-none"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-tl-none rounded-bl-none">
                Filter by <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getVisibleLeafColumns()
                .filter((column) => column.getCanFilter())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className={`pl-2 capitalize not-last:mb-1 ${column.id === filterBy ? 'bg-muted' : ''}`}
                      checked={column.getIsFiltered()}
                      onCheckedChange={(value) => value && setFilterBy(column.id)}
                    >
                      {column.id.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

      <div className="overflow-hidden rounded-md border">
        <Table>
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
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
              </p>
            ) : (
              <p>{table.getFilteredRowModel().rows.length} row(s) found.</p>
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
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
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

          <PageSelectorInput {...table} />

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function PageSelectorInput(table: TableType<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [pageInput, setPageInput] = React.useState(`${table.getState().pagination.pageIndex + 1}`);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);

    let page = Number(value);
    const maxPage = table.getPageCount();

    if (!value || isNaN(page) || page < 1) {
      page = 1;
    } else if (page > maxPage) {
      page = maxPage;
    }

    if (!isNaN(Number(value))) {
      table.setPageIndex(page - 1);
    }
  };

  // Sync input value with table page index
  // (e.g., when using navigation buttons)
  React.useEffect(() => {
    setPageInput(`${table.getState().pagination.pageIndex + 1}`);
  }, [table]);

  return (
    <div className="flex w-fit items-center justify-center gap-2 text-sm font-medium">
      <p>Page</p>
      <Input
        id="table-page"
        type="number"
        min="1"
        max={table.getPageCount()}
        value={pageInput}
        onChange={handlePageInputChange}
        className="h-fit w-16 rounded-md border text-right"
      />
      <p>of {table.getPageCount()}</p>
    </div>
  );
}

function TableCellViewer(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const isMobile = useIsMobile();

  const [state, action, pending] = React.useActionState<ActionState, FormData>(editRecord, {
    error: '',
    success: '',
  });

  const clockIn = formatTimeForDisplay(row.getValue('clock_in'), 'HH:mm:ss');
  const clockOut = formatTimeForDisplay(row.getValue('clock_out'), 'HH:mm:ss');
  const lunchIn = formatTimeForDisplay(row.getValue('lunch_in'), 'HH:mm:ss');
  const lunchOut = formatTimeForDisplay(row.getValue('lunch_out'), 'HH:mm:ss');

  const originalValues = React.useMemo(
    () => ({
      clock_in: formatTimeForDisplay(row.getValue('clock_in'), 'HH:mm:ss'),
      clock_out: formatTimeForDisplay(row.getValue('clock_out'), 'HH:mm:ss'),
      lunch_in: formatTimeForDisplay(row.getValue('lunch_in'), 'HH:mm:ss'),
      lunch_out: formatTimeForDisplay(row.getValue('lunch_out'), 'HH:mm:ss'),
      work_mode: row.getValue('work_mode') as string,
    }),
    [row],
  );

  const hasChanges = (formData: FormData) => {
    const currentValues = {
      clock_in: formData.get('clock_in') as string,
      clock_out: formData.get('clock_out') as string,
      lunch_in: formData.get('lunch_in') as string,
      lunch_out: formData.get('lunch_out') as string,
      work_mode: formData.get('work_mode') as string,
    };

    return Object.keys(originalValues).some((key) => {
      const originalValue = originalValues[key as keyof typeof originalValues];
      const currentValue = currentValues[key as keyof typeof currentValues];
      const hasChanged = originalValue !== currentValue;

      return hasChanged;
    });
  };

  const handleAction = async (formData: FormData) => {
    if (!hasChanges(formData)) {
      setOpenDrawer(false);
      return;
    }

    const timeFields = ['clock_in', 'clock_out', 'lunch_in', 'lunch_out'];

    timeFields.forEach((field) => {
      const timeValue = formData.get(field) as string;
      const workDate = formData.get('work_date') as string;

      if (timeValue) {
        const utcDateTime = formatTimeForDatabase(timeValue, workDate);
        formData.set(field, utcDateTime);
      }
    });

    await action(formData);
  };

  React.useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  React.useEffect(() => {
    if (state?.success) {
      toast.success('Success!', {
        description: state.success,
        action: { label: 'Close', onClick: () => {} },
      });
      setOpenDrawer(false);
    }
  }, [state]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'} open={openDrawer} onOpenChange={setOpenDrawer}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {row.getValue('full_name')}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit employee record</DrawerTitle>
          <DrawerDescription>Review the information, make edits, and save.</DrawerDescription>
        </DrawerHeader>
        <form id="edit-record-form" className="flex flex-col gap-4 p-4" action={handleAction}>
          <input type="hidden" name="work_date" value={row.original.work_date} />
          <input type="hidden" name="employee_id" value={row.original.employee_id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="clock_in">Clock In</Label>
              <Input
                id="clock_in"
                name="clock_in"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={clockIn}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="lunch_out">Lunch Out</Label>
              <Input
                id="lunch_out"
                name="lunch_out"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={lunchOut}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="lunch_in">Lunch In</Label>
              <Input
                id="lunch_in"
                name="lunch_in"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={lunchIn}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="clock_out">Clock Out</Label>
              <Input
                id="clock_out"
                name="clock_out"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={clockOut}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="work_mode">Work Mode</Label>
            <Select name="work_mode" defaultValue={row.getValue('work_mode')}>
              <SelectTrigger id="work_mode" className="w-full">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(WorkMode).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {capitalizeFirstLetter(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DrawerFooter>
          <Button type="submit" form="edit-record-form" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function RowMenuUser(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [remarks, setRemarks] = React.useState<Remarks[keyof Remarks]>();

  const [state, action, pending] = React.useActionState<ActionState, FormData>(editRemarks, {
    error: '',
    success: '',
  });

  React.useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  React.useEffect(() => {
    if (state?.success) {
      toast.success('Success!', {
        description: state.success,
        action: { label: 'Close', onClick: () => {} },
      });
      setOpenDrawer(false);
    }
  }, [state?.success]);

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer);
    setRemarks('');
  };

  return (
    <Dialog open={openDrawer} onOpenChange={handleOpenDrawer}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DialogTrigger asChild>
            <DropdownMenuItem>Edit Remarks</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input type="hidden" name="work_date" value={row.original.work_date} />
          <input type="hidden" name="employee_id" value={row.original.employee_id} />

          <DialogHeader>
            <DialogTitle>Edit remarks</DialogTitle>
            <DialogDescription>Make your changes and save.</DialogDescription>
          </DialogHeader>

          <div className="text-sm">
            <p className="mb-3 font-medium">Previous remarks</p>
            <p className={`${setRemarkColor(row.getValue('remarks'))} w-fit`}>{row.getValue('remarks') ?? '-'}</p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="remarks">Remarks</Label>
            <Select name="remarks" disabled={pending} onValueChange={setRemarks}>
              <SelectTrigger id="remarks" className="w-full">
                <SelectValue placeholder="Select a remark" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Remarks).map((remark) => (
                  <SelectItem key={remark} value={remark}>
                    {remark}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {remarks === Remarks.SpecifyOtherRemark && (
              <Input
                type="text"
                name="other_remarks"
                placeholder="e.g. doctor’s appointment"
                disabled={pending}
                autoComplete="off"
                required
              />
            )}
          </div>

          <DialogFooter className="sm:flex-col-reverse">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RowMenuAdmin(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const [state, action, pending] = React.useActionState<ActionState, FormData>(deleteRecord, {
    error: '',
  });

  React.useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DialogTrigger asChild>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input type="hidden" name="id" value={row.original.id} />

          <DialogHeader>
            <DialogTitle>Delete this record</DialogTitle>
            <DialogDescription>Are you sure you want to delete this record?</DialogDescription>
          </DialogHeader>

          <ul className="flex flex-col flex-wrap gap-4 rounded-md border p-4 text-sm">
            <li className="flex items-center gap-2">
              <p className="text-xs">Name:</p>
              <p className="font-medium">{row.getValue('full_name')}</p>
            </li>
            <li className="flex items-center gap-2">
              <p className="text-xs">Date:</p>
              <p className="font-medium">{row.getValue('work_date')}</p>
            </li>
          </ul>

          <DialogFooter className="sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant={'destructive'} type="submit" disabled={pending}>
              {pending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MultiSelectDeleteButton(table: TableType<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDialog, setOpenDialog] = React.useState(false);

  const [state, action, pending] = React.useActionState<ActionState, FormData>(deleteMultipleRecords, {
    error: '',
  });

  React.useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'sm'} className="text-destructive/75 hover:text-destructive max-w-sm">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input
            type="hidden"
            name="ids"
            value={table
              .getSelectedRowModel()
              .rows.map((row) => row.original.id)
              .join(',')}
          />

          <DialogHeader>
            <DialogTitle>Delete these records</DialogTitle>
            <DialogDescription>Are you sure you want to delete these records?</DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button variant={'destructive'} type="submit" disabled={pending}>
              {pending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

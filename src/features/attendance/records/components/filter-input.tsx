import { Table } from '@tanstack/react-table';
import { ChevronDown, Info, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';

export default function FilterInput({
  filters,
  onFilterChange,
  isLoading,
  table,
}: {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  isLoading: boolean;
  table: Table<AttendanceRecord | AttendanceRecordWithUserDetails>;
}) {
  const [currentFilterKey, setCurrentFilterKey] = useState('remarks');

  return (
    <div className="relative flex w-full items-center">
      <Input
        id="remarks-filter"
        name="remarks-filter"
        type="text"
        placeholder={`Filter ${currentFilterKey.replace('_', ' ')}...`}
        value={filters[currentFilterKey] || ''}
        onChange={(e) => onFilterChange(currentFilterKey, e.target.value)}
        className="max-w-sm rounded-tr-none rounded-br-none text-sm"
      />
      {currentFilterKey === 'work_date' && (
        <p className="text-muted-foreground absolute top-full left-0 flex w-full translate-y-1/2 items-center gap-1 text-xs">
          <Info size={16} />
          use YYYY-MM-DD format
        </p>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="rounded-tl-none rounded-bl-none" disabled={isLoading}>
            Filter by {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" hidden={isLoading}>
          {table
            .getVisibleLeafColumns()
            .filter((column) => column.getCanFilter())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className={`pl-2 capitalize not-last:mb-1 ${column.id === currentFilterKey ? 'bg-muted' : ''}`}
                  checked={column.getIsFiltered()}
                  onCheckedChange={(value) => value && setCurrentFilterKey(column.id)}
                  disabled={column.id === currentFilterKey}
                >
                  {column.id.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

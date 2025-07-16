import { ChangeEvent, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

export default function PageSelectorInput({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const [pageInput, setPageInput] = useState(`${currentPage}`);

  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);

    let page = Number(value);

    if (!value || isNaN(page) || page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    if (!isNaN(Number(value))) {
      onPageChange(page);
    }
  };

  // Sync input value with table page index
  // (e.g., when using navigation buttons)
  useEffect(() => {
    setPageInput(`${currentPage}`);
  }, [currentPage]);

  return (
    <div className="flex w-fit items-center justify-center gap-2 text-sm font-medium">
      <p>Page</p>
      <Input
        id="table-page"
        type="number"
        min="1"
        max={totalPages}
        value={pageInput}
        onChange={handlePageInputChange}
        className="h-fit w-16 rounded-md border text-right"
      />
      <p>of {totalPages}</p>
    </div>
  );
}


"use client";

interface YearFilterProps {
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export default function YearFilter({ selectedYear, onYearChange }: YearFilterProps) {
  return (
    <div className="relative">
      <input
        type="number"
        placeholder="Year"
        value={selectedYear || ''}
        onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value, 10) : null)}
        className="w-full px-4 py-3 text-white bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
      />
    </div>
  );
}


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
        className="w-full rounded-xl border border-cyan-300/25 bg-slate-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/45 transition-all"
      />
    </div>
  );
}

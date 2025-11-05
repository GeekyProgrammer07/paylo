"use client";

export const Select = ({
  options,
  onSelect,
}: {
  onSelect: (value: string) => void;
  options: {
    key: string;
    value: string;
  }[];
}) => {
  return (
    <select
      onChange={(e) => {
        onSelect(e.target.value);
      }}
      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-800 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 hover:border-gray-300"
    >
      {options.map((option) => (
        <option key={option.key}>{option.value}</option>
      ))}
    </select>
  );
};

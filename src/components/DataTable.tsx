import { CSVRow } from '../utils/csvValidation';

interface DataTableProps {
  data: CSVRow[];
  invalidIndices?: Set<number>;
  maxRows?: number;
  showRowNumbers?: boolean;
}

export function DataTable({
  data,
  invalidIndices = new Set(),
  maxRows = 500,
  showRowNumbers = true
}: DataTableProps) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              {showRowNumbers && (
                <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b">
                  #
                </th>
              )}
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left py-2 px-3 font-semibold text-gray-700 border-b whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => {
              const isInvalid = invalidIndices.has(index);
              const rowClass = isInvalid
                ? 'bg-red-50 hover:bg-red-100'
                : 'bg-green-50 hover:bg-green-100';

              return (
                <tr key={index} className={rowClass}>
                  {showRowNumbers && (
                    <td className={`py-2 px-3 border-b font-medium ${
                      isInvalid ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {index + 1}
                    </td>
                  )}
                  {headers.map((header, i) => (
                    <td key={i} className="py-2 px-3 text-gray-700 border-b">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {maxRows && data.length > maxRows && (
        <p className="text-xs text-gray-500">
          Showing first {maxRows} rows of {data.length}
        </p>
      )}
    </div>
  );
}

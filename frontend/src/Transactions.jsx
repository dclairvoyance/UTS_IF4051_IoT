import { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";
import { TRANSACTIONS_COLUMNS } from "./constants/columns";
import { MdSearch } from "react-icons/md";

const Transactions = () => {
  const columns = TRANSACTIONS_COLUMNS;
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:5001/transactions", {
        params: {
          account_holder: filter,
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch data");
      }
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  return (
    <div className="mx-auto p-4 md:p-12 dark:text-white">
      <div className="mb-2 flex justify-between items-center">
        <div className="font-bold text-lg text-center">Transactions</div>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <MdSearch />
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full h-8 p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search holder..."
            required
            onChange={handleSearch}
          />
        </div>
      </div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th key={column.id} {...column.getHeaderProps()}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell, index) => {
                  return (
                    <td key={index} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;

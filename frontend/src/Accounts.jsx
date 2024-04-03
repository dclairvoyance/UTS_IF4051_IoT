import { useState, useEffect } from "react";
import { useTable } from "react-table";
import { ACCOUNTS_COLUMNS } from "./constants/columns";
import TopUp from "./TopUp";

const Accounts = () => {
  const columns = ACCOUNTS_COLUMNS;
  const [data, setData] = useState([]);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [dataTopUp, setDataTopUp] = useState({});
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const handleOpenModal = (row) => {
    setDataTopUp(row.values);
    setOpenTopUp(true);
  };
  const actions = [{ label: "Top Up", onClick: handleOpenModal }];
  const handleTopUp = () => {
    fetchAccounts();
    setOpenTopUp(false);
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch("http://localhost:5001/accounts");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="mx-auto p-4 md:p-12 dark:text-white">
      <div className="mb-2 font-bold text-lg h-8">Accounts</div>
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
                      {index === row.cells.length - 1 && (
                        <div>
                          {actions.map((action, index) => (
                            <button
                              key={index}
                              className="bg-[#f9f9f9] dark:text-black"
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {openTopUp && <TopUp onCloseModal={handleTopUp} dataModal={dataTopUp} />}
    </div>
  );
};

export default Accounts;

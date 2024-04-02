import { addThousandSeparators } from "../helpers";

const ACCOUNTS_COLUMNS = [
  {
    Header: "ID",
    accessor: "id",
  },
  {
    Header: "Holder",
    accessor: "holder",
  },
  {
    Header: "Balance",
    accessor: "balance",
    Cell: (props) => {
      return addThousandSeparators(props.value);
    },
  },
  {
    Header: "RFID",
    accessor: "rfid",
  },
  {
    Header: "Actions",
    accessor: "actions",
  },
];

export { ACCOUNTS_COLUMNS };

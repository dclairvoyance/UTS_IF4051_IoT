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
      return "Rp" + addThousandSeparators(props.value);
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

const TRANSACTIONS_COLUMNS = [
  {
    Header: "Time",
    accessor: "time",
    Cell: (props) => {
      return new Date(props.value).toLocaleString();
    },
  },
  {
    Header: "Account ID",
    accessor: "account_id",
  },
  {
    Header: "Account Holder",
    accessor: "holder",
  },
  {
    Header: "Amount",
    accessor: "amount",
    Cell: (props) => {
      return "Rp" + addThousandSeparators(props.value);
    },
  },
];

export { ACCOUNTS_COLUMNS, TRANSACTIONS_COLUMNS };

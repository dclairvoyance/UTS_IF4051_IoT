const addThousandSeparators = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const removeThousandSeparators = (num) => {
  return num.toString().replace(/\./g, "");
};

const removeNonNumeric = (num) => {
  return parseInt(num.toString().replace(/[^0-9]/g, ""));
};

export { addThousandSeparators, removeThousandSeparators, removeNonNumeric };

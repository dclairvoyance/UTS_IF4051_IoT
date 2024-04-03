import { useState } from "react";
import PropTypes from "prop-types";
import { MdClose } from "react-icons/md";
import {
  addThousandSeparators,
  removeThousandSeparators,
  removeNonNumeric,
} from "./helpers";

const TopUp = ({ onCloseModal, dataModal }) => {
  const [buttonAmount, setButtonAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState(0);

  const handleClose = () => {
    onCloseModal();
  };

  const handleInputCustomAmount = (e) => {
    const newInput = removeThousandSeparators(e.target.value);
    // (number or empty) and less than 100000000
    if (!isNaN(newInput) || newInput === "") {
      setCustomAmount(
        newInput !== ""
          ? parseInt(newInput) < 100000000
            ? parseInt(removeNonNumeric(newInput))
            : customAmount
          : 0
      );
    }
    setButtonAmount(0);
  };

  const handleInputButtonAmount = (e) => {
    setButtonAmount(parseInt(e.target.value));
    setCustomAmount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5001/accounts/update_balance/${dataModal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: customAmount === 0 ? buttonAmount : customAmount,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update data");
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#282525] bg-opacity-95">
      <form onSubmit={handleSubmit}>
        <div className="flex-col w-[28rem] rounded-md bg-white p-4 dark:text-black">
          <div className="flex justify-end">
            <button className="bg-[#f9f9f9] rounded-full" onClick={handleClose}>
              <MdClose />
            </button>
          </div>
          <div className="font-bold text-lg text-center mb-3">Top Up</div>
          <div className="mb-2">
            <span className="font-semibold">Initial balance: </span>
            <span>Rp{addThousandSeparators(dataModal.balance)}</span>
          </div>
          <div className="mb-2">
            <div className="mb-1 font-semibold">Amount:</div>
            <div className="mb-2 flex justify-between">
              <button
                type="button"
                className={`${
                  buttonAmount === 100000
                    ? "border-2 border-[#145da0] text-[#145da0] font-semibold"
                    : "border-black"
                } bg-[#f9f9f9] `}
                value={100000}
                onClick={handleInputButtonAmount}
              >
                100.000
              </button>
              <button
                type="button"
                className={`${
                  buttonAmount === 50000
                    ? "border-2 border-[#145da0] text-[#145da0] font-semibold"
                    : "border-black"
                } bg-[#f9f9f9]`}
                value={50000}
                onClick={handleInputButtonAmount}
              >
                50.000
              </button>
              <button
                type="button"
                className={`${
                  buttonAmount === 20000
                    ? "border-2 border-[#145da0] text-[#145da0] font-semibold"
                    : "border-black"
                } bg-[#f9f9f9]`}
                value={20000}
                onClick={handleInputButtonAmount}
              >
                20.000
              </button>
              <button
                type="button"
                className={`${
                  buttonAmount === 10000
                    ? "border-2 border-[#145da0] text-[#145da0] font-semibold"
                    : "border-black"
                } bg-[#f9f9f9]`}
                value={10000}
                onClick={handleInputButtonAmount}
              >
                10.000
              </button>
            </div>
            <div className="mb-2 flex h-11">
              <div className="flex items-center">Custom:</div>
              <input
                type="text"
                value={
                  customAmount === 0 ? "" : addThousandSeparators(customAmount)
                }
                className={`${
                  customAmount !== 0
                    ? "border-2 border-[#145da0] text-[#145da0] font-semibold"
                    : "ring-1 ring-black"
                } bg-[#f9f9f9] rounded-lg px-2 ml-3 text-right w-32`}
                placeholder="0"
                onChange={handleInputCustomAmount}
              />
            </div>

            <div className="text-red text-xs">
              (maksimal Rp100.000.000 aja, mending sedekah :D)
            </div>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Final balance: </span>
            <span>
              Rp
              {customAmount === 0
                ? buttonAmount === 0
                  ? addThousandSeparators(dataModal.balance)
                  : addThousandSeparators(
                      dataModal.balance + parseInt(buttonAmount)
                    )
                : addThousandSeparators(
                    dataModal.balance + parseInt(customAmount)
                  )}
            </span>
          </div>
          <button
            disabled={customAmount === 0 && buttonAmount === 0}
            type="submit"
            className="bg-[#145da0] text-white disabled:bg-[#c5d7e7]"
          >
            Gas!
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopUp;

TopUp.propTypes = {
  onCloseModal: PropTypes.func.isRequired,
  dataModal: PropTypes.object.isRequired,
};

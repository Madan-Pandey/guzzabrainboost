// components/Popup.tsx
import React from "react";

interface PopupProps {
  isOpen: boolean;
  closePopup: () => void;
  points : number
}

const Popup: React.FC<PopupProps> = ({ isOpen, closePopup, points }) => {
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
        <h2 className="text-lg font-semibold mb-4">Popup Title</h2>
        <p className="text-sm mb-4">{points}</p>

        <button
          className=" absolute top-2 right-2 p-2 bg-gray-200 rounded-full"
          onClick={closePopup}
        >
          X
        </button>

        <div className="mt-4">
          <button
            className="px-4 quizPbtn py-2 bg-blue-500 text-white rounded-md"
            onClick={closePopup}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;

import React, { useState } from "react";

type QbtnType = {
  option: string;
  index: number;
  correctAnswer: number;
  answerChecked:boolean;
  selectedAnswer : number;
  setSelectedAnswer : any;
};

function Qbtn({
  option,
  index,
  correctAnswer,
  selectedAnswer,
  setSelectedAnswer,
  answerChecked
}: QbtnType) {
  return (
    <div className="w-full group relative">
      <button>{option}</button>
    </div>
  );
}

export default Qbtn;

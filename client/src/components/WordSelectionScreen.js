import React from 'react';
import './WordSelectionScreen.css';

const WordSelectionScreen = ({ wordOptions, onWordSelect, canChooseWord, isDrawing }) => {
  if (isDrawing) {
    return (
      <div className="word-selection-screen">
        <div className="word-selection-container">
          <div className="word-selection-content">
            <h2 className="word-selection-title">Choose a word</h2>
            <div className="word-options">
              {wordOptions.map((word, index) => (
                <button
                  key={index}
                  onClick={() => onWordSelect(word)}
                  className="word-option-button"
                  disabled={!canChooseWord}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="word-selection-screen">
      <div className="word-selection-container">
        <div className="word-selection-content">
          <h2 className="word-selection-title">Waiting for word selection...</h2>
          <div className="word-options">
            {wordOptions.map((word, index) => (
              <div key={index} className="word-option-display">
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSelectionScreen;

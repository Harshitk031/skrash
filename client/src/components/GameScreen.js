import React, { useEffect, useState } from 'react';
import Canvas from './Canvas';
import Chat from './Chat';
import PlayerList from './PlayerList';
import './GameScreen.css';

const GameScreen = ({
  playerName,
  isHost,
  canDraw,
  guessWord,
  wordCount,
  timer,
  penColor,
  brushSize,
  players,
  chatMessages,
  scoreBoard,
  audioMute,
  onAudioToggle,
  onColorChange,
  onBrushSizeChange,
  onSendChat,
  onClearCanvas,
  onVote,
  socket,
  chosenPlayer,
  round
}) => {
  const [chatInput, setChatInput] = useState('');
  const [wordDisplay, setWordDisplay] = useState('');

  useEffect(() => {
    if (canDraw) {
      setWordDisplay(guessWord);
    } else if (wordCount > 0) {
      const dashStr = "(" + String(wordCount) + "): " + "_ ".repeat(wordCount);
      setWordDisplay("Word: " + dashStr);
    } else {
      setWordDisplay("Word: ");
    }
  }, [canDraw, guessWord, wordCount]);

  const handleChatSubmit = (message) => {
    if (message && message.trim().length > 0) {
      onSendChat(message.trim());
    }
  };

  const colorOptions = [
    '#FF0000', '#4ae000', '#0041c4', '#fbd420', '#fb5819',
    '#bc19fb', '#904e0c', '#000000', '#ffffff'
  ];

  return (
    <div className="game-screen">
      <div className="game-layout">
        
        {/* Left Sidebar - Player List */}
        <div className="left-sidebar">
          <PlayerList players={players} currentPlayerName={playerName} drawingPlayerName={chosenPlayer} />
        </div>

        {/* Main Game Area */}
        <div className="main-game-area">
          
          {/* Top Bar */}
          <div className="top-bar">
            <div className="round-display">Round {round + 1}</div>
            <div className="word-display">{wordDisplay}</div>
            <div className="timer-container">
              <img src="/images/timer.png" alt="Timer" className="timer-icon" />
              <div className="timer">[{timer}]</div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-container">
            <Canvas
              canDraw={canDraw}
              penColor={penColor}
              brushSize={brushSize}
              socket={socket}
              onBrushSizeChange={onBrushSizeChange}
            />
          </div>

          {/* Bottom Bar - Drawing Tools */}
          {canDraw && (
            <div className="bottom-bar">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className="color-button"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  title={`Color: ${color}`}
                />
              ))}
              <div className="brush-controls">
                <button
                  className="brush-size-btn"
                  onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
                  title="Decrease Brush Size"
                >
                  ➖
                </button>
                <span className="brush-size-display">{brushSize}</span>
                <button
                  className="brush-size-btn"
                  onClick={() => onBrushSizeChange(Math.min(20, brushSize + 1))}
                  title="Increase Brush Size"
                >
                  ➕
                </button>
              </div>
              <button
                className="clear-button"
                onClick={onClearCanvas}
                title="Clear Canvas"
              >
                🗑️
              </button>
            </div>
          )}

          {/* Voting Buttons */}
          {!canDraw && (
            <div className="voting-container">
              <button
                className="vote-button"
                onClick={() => onVote('up')}
                title="Like the drawing"
              >
                <img src="/images/thumbsup.gif" alt="Thumbs Up" />
              </button>
              <button
                className="vote-button"
                onClick={() => onVote('down')}
                title="Dislike the drawing"
              >
                <img src="/images/thumbsdown.gif" alt="Thumbs Down" />
              </button>
            </div>
          )}

          {/* Audio Control */}
          <button
            className="audio-control"
            onClick={onAudioToggle}
            title={audioMute ? "Unmute Audio" : "Mute Audio"}
          >
            <img
              src={audioMute ? "/images/audioOff.gif" : "/images/audioOn.gif"}
              alt="Audio Control"
            />
          </button>
        </div>

        {/* Right Sidebar - Chat */}
        <div className="right-sidebar">
          <Chat
            messages={chatMessages}
            inputValue={chatInput}
            onInputChange={setChatInput}
            onSubmit={handleChatSubmit}
            disabled={canDraw}
            wordCount={chatInput.length}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;

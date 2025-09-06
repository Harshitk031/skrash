import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import WaitingScreen from './components/WaitingScreen';
import HostScreen from './components/HostScreen';
import WordSelectionScreen from './components/WordSelectionScreen';
import GameOverScreen from './components/GameOverScreen';
import './App.css';

const socket = io({
  autoConnect: false
});

function App() {
  const [gameState, setGameState] = useState('login'); // login, waiting, host, game, wordSelection
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [canDraw, setCanDraw] = useState(false);
  const [canChooseWord, setCanChooseWord] = useState(false);
  const [wordOptions, setWordOptions] = useState([]);
  const [chosenPlayer, setChosenPlayer] = useState('');
  const [round, setRound] = useState(0);
  const [guessWord, setGuessWord] = useState('');
  const [guessedPlayer, setGuessedPlayer] = useState(false);
  const [atleastOneGuessed, setAtleastOneGuessed] = useState(false);
  const [audioMute, setAudioMute] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(1);
  const [timer, setTimer] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [scoreBoard, setScoreBoard] = useState([]);
  const [winners, setWinners] = useState([]);
  const [countdownInterval, setCountdownInterval] = useState(null);

  const playSound = useCallback((src) => {
    if (!audioMute) {
      const audio = new Audio(src);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [audioMute]);

  useEffect(() => {
    // Socket event listeners
    socket.on('welcom', (msg) => {
      console.log(msg);
    });

    socket.on('hostPlayer', (boolVal) => {
      setIsHost(boolVal);
      if (boolVal) {
        setGameState('host');
      }
    });

    socket.on('gameStarted', () => {
      console.log("GAME STARTED!!");
      setGameState('game');
      // Clear chat messages for new game
      setChatMessages([]);
    });

    socket.on('newPlayerJoined', (newPlayerName) => {
      playSound('/sfx/joinGame.mp3');
      console.log(newPlayerName, " joined 👋🏻");
      addChatMessage('Server', newPlayerName + " joined 👋🏻", "green");
      addPlayer(newPlayerName, 0);
    });

    socket.on('playersList', (playersList) => {
      const pList = JSON.parse(playersList);
      for (const player in pList) {
        if (player !== playerName) {
          addPlayer(player, pList[player]);
        }
      }
    });

    socket.on('wordCount', (guessWordCount) => {
      if (!canDraw) {
        setWordCount(guessWordCount);
      }
    });

    socket.on('allGuessed', () => {
      playSound("/sfx/allGuess.mp3");
    });

    socket.on('chatContent', (content) => {
      console.log('Received chat message:', content);
      // Handle standardized message format
      if (typeof content === 'object' && content.playerName && content.content) {
        addChatMessage(content.playerName, content.content, content.color || 'black');
      } else {
        console.error('Invalid chat message format:', content);
      }
    });

    socket.on('chosenPlayer', (drawingPlayer) => {
      console.log(`Chosen player: ${drawingPlayer[0]}, Current player: ${playerName}`);
      setChosenPlayer(drawingPlayer[0]);
      setRound(drawingPlayer[1]);
      setGuessedPlayer(false);
      setAtleastOneGuessed(false);
      // Clear previous round's messages
      setChatMessages([]);
        addChatMessage('Server', drawingPlayer[0] + ' is drawing', 'blue');
      
      if (drawingPlayer[0] === playerName) {
        console.log('I am the drawing player');
        setCanDraw(true);
      } else {
        console.log('I am not the drawing player');
        setCanDraw(false);
        // Don't set game state here - wait for wordList event
      }
    });

    socket.on('wordList', (wordList) => {
      console.log(`Received word list: ${wordList[0].join(', ')}`);
      if (wordList[1] === round) {
        setWordOptions(wordList[0]);
        setGameState('wordSelection');
      }
    });

    socket.on('chosenWord', (wordAndPlayer) => {
      if (playerName === wordAndPlayer[1]) {
        handleWordSelection(wordAndPlayer[0], true);
      }
    });

    socket.on('chooseStart', (chooseTime) => {
      console.log(`Word selection started with ${chooseTime} seconds`);
      setTimer(chooseTime);
      setCanChooseWord(true);
      // Only show word selection screen to the drawing player
      if (chosenPlayer === playerName) {
        setGameState('wordSelection');
      }
      
      // Start countdown timer
      if (countdownInterval) clearInterval(countdownInterval);
      const interval = setInterval(() => {
        setTimer(prev => {
          console.log(`Timer countdown: ${prev} -> ${prev - 1}`);
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCountdownInterval(interval);
    });

    socket.on('chooseEnd', () => {
      setCanChooseWord(false);
      setGameState('game');
      // Clear countdown timer
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
    });

    socket.on('drawStart', (drawtime) => {
      console.log(`Drawing started with ${drawtime} seconds`);
      playSound("/sfx/startDrawing.mp3");
      setTimer(drawtime);
      setGameState('game');
      
      // Start countdown timer for drawing
      if (countdownInterval) clearInterval(countdownInterval);
      const interval = setInterval(() => {
        setTimer(prev => {
          console.log(`Drawing timer countdown: ${prev} -> ${prev - 1}`);
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCountdownInterval(interval);
    });

    socket.on('drawEnd', () => {
      setCanDraw(false);
      if (!atleastOneGuessed) {
        playSound("/sfx/noGuess.mp3");
      }
      // Clear countdown timer
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
    });

    socket.on('correctGuess', (correctGuessPlayer) => {
      setAtleastOneGuessed(true);
      playSound("/sfx/correctGuess.mp3");
      addChatMessage('Server', correctGuessPlayer[0] + " guessed the word!", "green");
      if (playerName === correctGuessPlayer[0]) {
        setGuessWord(correctGuessPlayer[1]);
        setGuessedPlayer(true);
      }
    });

    socket.on('playerLeft', (leftPlayer) => {
      playSound("/sfx/leaveGame.mp3");
      removePlayer(leftPlayer);
      addChatMessage('Server', leftPlayer + " left :(", "red");
    });

    socket.on('scoreBoard', (newScoreBoard) => {
      setScoreBoard(newScoreBoard);
      updatePlayerScores(newScoreBoard);
    });

    socket.on('roundComplete', (roundData) => {
      console.log("Round completed:", roundData);
      // Clear the current word display
      setGuessWord('');
      setWordCount(0);
      setGuessedPlayer(false);
      setAtleastOneGuessed(false);
    });

    socket.on('gameOver', (finalScores) => {
      console.log("GAME OVER!");
      setWinners(finalScores);
      setGameState('gameOver');
    });

    socket.on('disconnect', () => {
      socket.disconnect();
      setGameState('login');
      window.location.reload();
    });

    return () => {
      socket.off('welcom');
      socket.off('hostPlayer');
      socket.off('gameStarted');
      socket.off('newPlayerJoined');
      socket.off('playersList');
      socket.off('wordCount');
      socket.off('allGuessed');
      socket.off('chatContent');
      socket.off('chosenPlayer');
      socket.off('wordList');
      socket.off('chosenWord');
      socket.off('chooseStart');
      socket.off('chooseEnd');
      socket.off('drawStart');
      socket.off('drawEnd');
      socket.off('correctGuess');
      socket.off('playerLeft');
      socket.off('scoreBoard');
      socket.off('roundComplete');
      socket.off('gameOver');
      socket.off('disconnect');
      
      // Clean up countdown interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [playerName, canDraw, guessedPlayer, guessWord, atleastOneGuessed, countdownInterval, chosenPlayer, round, playSound]);

  const addPlayer = (playerName, score) => {
    setPlayers(prev => [...prev, { name: playerName, score }]);
  };

  const removePlayer = (playerName) => {
    setPlayers(prev => prev.filter(p => p.name !== playerName));
  };

  const updatePlayerScores = (newScoreBoard) => {
    setPlayers(prev => prev.map(player => {
      const scoreEntry = newScoreBoard.find(entry => entry[0] === player.name);
      return scoreEntry ? { ...player, score: scoreEntry[1] } : player;
    }));
  };

  const addChatMessage = (playerName, content, color = "black") => {
    setChatMessages(prev => [{
      id: Date.now(),
      playerName,
      content,
      color,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const handleLogin = (name, code, mode) => {
    setPlayerName(name);
    setRoomCode(code || '');
    
    socket.connect();
    addPlayer(name, 0);
    
    // Emit room information based on mode
    if (mode === 'create') {
      socket.emit('createRoom', { playerName: name, roomCode: code });
    } else if (mode === 'join') {
      socket.emit('joinRoom', { playerName: name, roomCode: code });
    } else {
      // Public room
      socket.emit('playerName', name);
    }
    
    setGameState('waiting');
  };

  const handleStartGame = () => {
    socket.emit('startGame');
    setGameState('game');
  };

  const handleWordSelection = (word, autoSelected = false) => {
    if (!autoSelected) {
      socket.emit('chosenWord', word);
    }
    setGuessWord(word);
    setGameState('game');
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'waiting':
        return <WaitingScreen roomCode={roomCode} />;
      case 'host':
        return <HostScreen onStartGame={handleStartGame} roomCode={roomCode} />;
      case 'gameOver':
        return <GameOverScreen winners={winners} />;
      case 'wordSelection':
        return (
          <WordSelectionScreen
            wordOptions={wordOptions}
            onWordSelect={handleWordSelection}
            canChooseWord={canChooseWord}
            isDrawing={canDraw}
          />
        );
      case 'game':
        return (
          <GameScreen
            playerName={playerName}
            isHost={isHost}
            canDraw={canDraw}
            guessWord={guessWord}
            wordCount={wordCount}
            timer={timer}
            penColor={penColor}
            brushSize={brushSize}
            players={players}
            chatMessages={chatMessages}
            scoreBoard={scoreBoard}
            round={round}
            audioMute={audioMute}
            onAudioToggle={() => setAudioMute(!audioMute)}
            onColorChange={setPenColor}
            onBrushSizeChange={setBrushSize}
            onSendChat={(message) => {
              if (message.length > 0) {
                socket.emit('updateText', [playerName, message]);
              }
            }}
            onClearCanvas={() => {
              if (canDraw) {
                socket.emit('clearCanvas');
              }
            }}
            onVote={(direction) => {
              socket.emit('vote', [playerName, direction]);
            }}
            socket={socket}
            chosenPlayer={chosenPlayer}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;

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
  const [loginErrorTick, setLoginErrorTick] = useState(0);

  const playSound = useCallback((src) => {
    if (!audioMute) {
      const audio = new Audio(src);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [audioMute]);

  useEffect(() => {
    // Socket event listeners
    socket.on('welcome', (msg) => {
      console.log(msg);
    });


    socket.on('gameStarted', (game) => {
      console.log("GAME STARTED!!");
      setGameState('game');
      setPlayers(game.players.map(p => ({ name: p.playerName, score: p.score })));
      // Clear chat messages for new game
      setChatMessages([]);
    });

    socket.on('roomCreated', (game) => {
      setPlayers(game.players.map(p => ({ name: p.playerName, score: p.score })));
      const me = game.players.find(p => p.socID === socket.id);
      if (me && me.isRoomOwner) {
        setIsHost(true);
        setGameState('host');
      } else {
        setGameState('waiting');
      }
    });

    socket.on('playerListUpdate', (newPlayers) => {
        const newPlayerList = newPlayers.map(p => ({ name: p.playerName, score: p.score }));
        
        // Detect if a player has joined or left
        if (newPlayerList.length > players.length) {
            const newPlayer = newPlayerList.find(p => !players.some(op => op.name === p.name));
            if (newPlayer) {
                playSound('/sfx/joinGame.mp3');
                addChatMessage('Server', `${newPlayer.name} joined 👋🏻`, "green");
            }
        } else if (newPlayerList.length < players.length) {
            const leftPlayer = players.find(p => !newPlayerList.some(np => np.name === p.name));
            if (leftPlayer) {
                playSound('/sfx/leaveGame.mp3');
                addChatMessage('Server', `${leftPlayer.name} left :(`, "red");
            }
        }

        setPlayers(newPlayerList);
    });

    socket.on('gameStateUpdate', (gameState) => {
        setGameState('game');
        setChosenPlayer(gameState.currentDrawer);
        setWordCount(gameState.wordHint.length / 2);
        setRound(gameState.round);
        setPlayers(gameState.players);
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

    socket.on('roomClosed', () => {
      alert('Room was closed by the host');
      socket.disconnect();
      setGameState('login');
      window.location.reload();
    });

    socket.on('serverError', (message) => {
      console.error('Server error:', message);
      alert(message);
      setLoginErrorTick(t => t + 1);
    });

    socket.on('disconnect', () => {
      socket.disconnect();
      setGameState('login');
      window.location.reload();
    });

    return () => {
      socket.off('welcome');
      socket.off('gameStarted');
      socket.off('serverError');
      socket.off('roomClosed');
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
  }, [playerName, canDraw, guessedPlayer, guessWord, atleastOneGuessed, countdownInterval, chosenPlayer, round, playSound, players]);


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
    
    if (mode === 'create') {
      socket.emit('createRoom', { playerName: name, roomCode: code });
    } else if (mode === 'join') {
      socket.emit('joinRoom', { playerName: name, roomCode: code });
    }
    setGameState('waiting');
  };

  const handleStartGame = () => {
    socket.emit('startGame', roomCode);
    setGameState('game');
  };

  const handleWordSelection = (word, autoSelected = false) => {
    if (!autoSelected) {
      socket.emit('chosenWord', { roomCode, word });
    }
    setGuessWord(word);
    setGameState('game');
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} errorTick={loginErrorTick} />;
      case 'waiting':
        return <WaitingScreen roomCode={roomCode} players={players} />;
      case 'host':
        return <HostScreen onStartGame={handleStartGame} roomCode={roomCode} players={players} />;
      case 'gameOver':
        return <GameOverScreen winners={winners} onStartNewGame={() => window.location.reload()} />;
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
            roomCode={roomCode}
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
                socket.emit('updateText', { roomCode, playerName, message });
              }
            }}
            onClearCanvas={() => {
              if (canDraw) {
                socket.emit('clearCanvas', { roomCode });
              }
            }}
            onVote={(direction) => {
              socket.emit('vote', { roomCode, playerName, direction });
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

import React from 'react';
import './PlayerList.css';

const PlayerList = ({ players, currentPlayerName, drawingPlayerName }) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="player-list-container">
      <div className="player-list-header">
        <h3>Players ({players.length})</h3>
      </div>
      
      <div className="player-list">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.name} 
            className={`player-item ${index === 0 && player.score > 0 ? 'winner' : ''}`}
          >
            <div className="player-info">
              {index === 0 && player.score > 0 && (
                <div className="crown">👑</div>
              )}
              <div className="player-name">
                {player.name}
                {player.name === currentPlayerName && ' (you)'}
                {player.name === drawingPlayerName && ' ✏️'}
              </div>
            </div>
            <div className="player-score">{player.score}</div>
          </div>
        ))}
        
        {players.length === 0 && (
          <div className="no-players">
            <p>No players yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerList;

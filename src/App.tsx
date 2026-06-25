import { useState } from 'react';
import { Home } from './components/Home';
import { DraftRoom } from './components/DraftRoom';
import { getRoomId } from './lib/room';

function App() {
  const [roomId] = useState(getRoomId);

  return roomId ? <DraftRoom roomId={roomId} /> : <Home />;
}

export default App;

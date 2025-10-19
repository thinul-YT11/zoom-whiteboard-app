'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidV4 } from 'uuid';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const createAndJoin = () => {
    const newRoomId = uuidV4();
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      router.push(`/room/${roomId}`);
    } else {
      alert('Please enter a room ID');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Zoom Whiteboard</h1>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={joinRoom}
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Join Room
        </button>
        <button
          onClick={createAndJoin}
          className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
        >
          Create a new room
        </button>
      </div>
    </div>
  );
}
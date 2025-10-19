'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import Chat from '@/components/Chat';
import Whiteboard from '@/components/Whiteboard';

const Room = () => {
  const { roomId } = useParams();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [stream, setStream] = useState();

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:3001');
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      userVideo.current.srcObject = stream;
      socketRef.current.emit('join-room', roomId, socketRef.current.id);

      socketRef.current.on('user-connected', userId => {
        const peer = createPeer(userId, socketRef.current.id, stream);
        peersRef.current.push({
          peerID: userId,
          peer,
        });
        setPeers(peers => [...peers, peer]);
      });

      socketRef.current.on('signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.from);
        if (item) {
            item.peer.signal(payload.signal);
        } else {
            const peer = addPeer(payload.signal, payload.from, stream);
            peersRef.current.push({
                peerID: payload.from,
                peer,
            });
            setPeers(peers => [...peers, peer]);
        }
      });
    });

    socketRef.current.on('user-disconnected', userId => {
      const item = peersRef.current.find(p => p.peerID === userId);
      if (item) {
        item.peer.destroy();
      }
      const newPeers = peersRef.current.filter(p => p.peerID !== userId);
      peersRef.current = newPeers;
      setPeers(newPeers.map(p => p.peer));
    });

  }, [roomId]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        to: userToSignal,
        from: callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        to: callerID,
        from: socketRef.current.id,
        signal,
      });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <Chat socket={socketRef.current} />
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow bg-gray-300 p-4">
          <Whiteboard socket={socketRef.current} />
        </div>
        <div className="bg-gray-400 p-4">
          <h2 className="text-xl font-bold mb-4">Videos</h2>
          <div className="flex">
            <video muted ref={userVideo} autoPlay playsInline className="w-1/4" />
            {peers.map((peer, index) => {
              const Video = (props) => {
                const ref = useRef();

                useEffect(() => {
                  props.peer.on('stream', stream => {
                    ref.current.srcObject = stream;
                  });
                }, [props.peer]);

                return (
                  <video playsInline autoPlay ref={ref} className="w-1/4" />
                );
              }
              return (
                <Video key={index} peer={peer} />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
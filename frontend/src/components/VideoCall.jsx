import React, { useRef, useEffect } from 'react';

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const wsRef = useRef(null);
  const clientIdRef = useRef(null);

  useEffect(() => {
    const startCall = async () => {
      try {
       
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;

        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnectionRef.current = new RTCPeerConnection(configuration);

       
        localStreamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });

       
        peerConnectionRef.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

      
        wsRef.current = new WebSocket('ws://localhost:8080');
        wsRef.current.onopen = () => console.log('WebSocket connected');
        wsRef.current.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'offer') {
           
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
           
            wsRef.current.send(JSON.stringify({ ...message, type: 'answer' }));
          } else if (message.type === 'answer') {
            
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
          } else if (message.type === 'candidate') {
           
            await peerConnectionRef.current.addIceCandidate(message.candidate);
          }
        };

        // Send offer to signaling server
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({ type: 'offer', offer }));

        // Save client ID
        clientIdRef.current = Date.now().toString();
      } catch (error) {
        console.error('Error starting call:', error);
      }
    };

    startCall();

    return () => {
      // Clean up
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Function to send signaling messages
  const sendMessage = (message) => {
    wsRef.current.send(JSON.stringify({ ...message, sender: clientIdRef.current }));
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '50%', height: 'auto' }}></video>
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '50%', height: 'auto' }}></video>
    </div>
  );
};

export default VideoCall;

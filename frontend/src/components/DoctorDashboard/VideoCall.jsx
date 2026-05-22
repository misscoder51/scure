import React, { useEffect, useRef, useState } from 'react';

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }, []);

  const createPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection();
    peerConnectionRef.current.ontrack = handleTrackEvent;
    localStream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStream);
    });
    peerConnectionRef.current.onicecandidate = handleICECandidateEvent;

    const socket = new WebSocket('ws://localhost:5000/');
    socket.onopen = () => {
      console.log('Connected to signaling server');
      socket.onmessage = handleSocketMessage;
    };
  };

  const handleTrackEvent = (event) => {
    setRemoteStream(event.streams[0]);
  };

  const handleICECandidateEvent = (event) => {
    if (event.candidate) {
      const socket = new WebSocket('ws://localhost:5000/');
      socket.onopen = () => {
        const candidateData = {
          type: 'candidate',
          candidate: event.candidate
        };
        socket.send(JSON.stringify(candidateData));
      };
    }
  };

  const handleSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'offer') {
      peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
      peerConnectionRef.current.createAnswer()
        .then((answer) => {
          peerConnectionRef.current.setLocalDescription(answer);
          const socket = new WebSocket('ws://localhost:5000/');
          socket.onopen = () => {
            const answerData = {
              type: 'answer',
              answer: answer
            };
            socket.send(JSON.stringify(answerData));
          };
        })
        .catch((error) => {
          console.error('Error creating answer:', error);
        });
    } else if (message.type === 'answer') {
      peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
    } else if (message.type === 'candidate') {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  };

  const connectToStudent = () => {
    createPeerConnection();
    peerConnectionRef.current.createOffer()
      .then((offer) => {
        peerConnectionRef.current.setLocalDescription(offer);
        const socket = new WebSocket('ws://localhost:5000/');
        socket.onopen = () => {
          const offerData = {
            type: 'offer',
            offer: offer
          };
          socket.send(JSON.stringify(offerData));
        };
      })
      .catch((error) => {
        console.error('Error creating offer:', error);
      });
  };

  return (
    <div>
      <div>
        <h3>Your Video</h3>
        <video ref={localVideoRef} autoPlay muted />
      </div>
      <div>
        <h3>Student's Video</h3>
        <video ref={remoteVideoRef} autoPlay srcObject={remoteStream} />
      </div>
      <button onClick={connectToStudent}>Connect to Student</button>
    </div>
  );
};

export default VideoCall;

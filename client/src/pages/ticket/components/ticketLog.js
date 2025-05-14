import React, { useState, useEffect, useRef } from 'react';

const TicketLog = () => {
  const [logMessages, setLogMessages] = useState([]);
  const eventSource = useRef(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (typeof EventSource !== 'undefined') {
      eventSource.current = new EventSource('http://localhost:4000/api/ticket/4');

      eventSource.current.onmessage = (event) => {
        setLogMessages((prevMessages) => [...prevMessages, event.data]);
      };

      eventSource.current.onerror = (error) => {
        console.error('SSE 連線錯誤:', error);
      };

      return () => {
        if (eventSource.current) {
          eventSource.current.close();
        }
      };
    }
  }, []);

  const ScrollComponent = ({ boxRef }) => {
    useEffect(() => {
      if (boxRef.current) {
        const scrollInterval = setInterval(() => {
          const box = boxRef.current;
          const boxHeight = box.offsetHeight;
          if (box.scrollTop + boxHeight < box.scrollHeight) {
            box.scrollTop += 5;
          }
        }, 50);
  
        return () => clearInterval(scrollInterval);
      }
    }, [boxRef]);
  
    return null;
  };

  return (
    <div className="form">
      <h1>Bot State</h1>
      <div className="form-log" ref={logContainerRef}>
        {logMessages.map((message, index) => (
          <div key={index} style={{ padding: '0px' }}>{message}</div>
        ))}
        {logMessages.length === 0 && <div>No Log</div>}
      </div>
      <ScrollComponent boxRef={logContainerRef} />
    </div>
  );
};

export default TicketLog;
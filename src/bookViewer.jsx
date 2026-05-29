import { useEffect, useRef } from 'react';

const EmbeddedViewer = ({ isbn }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isbn || !canvasRef.current) return;

    canvasRef.current.innerHTML = '';
    const viewer = new google.books.DefaultViewer(canvasRef.current);
    viewer.load(isbn.startsWith('ISBN:') ? isbn : `ISBN:${isbn}`);
  }, [isbn]);

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#eee',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    />
  );
};

export default EmbeddedViewer;
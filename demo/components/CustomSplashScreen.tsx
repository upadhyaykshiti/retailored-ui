import { useEffect, useState } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
}

export default function CustomSplashScreen({ onAnimationComplete }: CustomSplashScreenProps) {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'reTailored';
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setAnimationComplete(true);
        onAnimationComplete();
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onAnimationComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <img 
        src="/layout/images/reTailoredLogo.jpg"
        alt="App Logo"
        style={{
          width: '100px',
          height: '100px',
          animation: 'pulse 1.5s infinite',
          marginBottom: '20px'
        }}
      />
      
      <div style={{
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        height: '30px',
        opacity: animationComplete ? 1 : 0.7,
        transition: 'opacity 0.3s ease'
      }}>
        {displayText}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
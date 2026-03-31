import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { RobotScene } from '../components/processing/RobotScene';
import { FileInfoCard } from '../components/processing/FileInfoCard';
import { ParseLog } from '../components/processing/ParseLog';
import { RoughBorder } from '../components/processing/RoughBorder';

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { file, setParseResult, setTransactionType, transactionType } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const parseFile = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setHasError(false);
    
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://edi-parser-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/v1/parse`, {
        method: 'POST',
        headers: {
          'X-Internal-Bypass': 'frontend-ui-secret',
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to parse file. Backend might be down.');
      }

      const result = await res.json();
      setParseResult(result);

      // Extract transaction type
      const type = result.transaction_type || 
                   result.metadata?.transaction_type || 
                   result.file_info?.transaction_type || 
                   "EDI File";
      setTransactionType(type);

      // Finish loading
      setIsLoading(false);

    } catch (err: any) {
      setHasError(true);
      console.error(err.message || String(err));
      setIsLoading(false);
    }
  };

  const hasParseStarted = useRef(false);

  useEffect(() => {
    if (!file) {
      navigate('/');
      return;
    }
    // ensure we don't spam start parse in strict mode
    if (!hasParseStarted.current) {
        hasParseStarted.current = true;
        parseFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#F5EFE0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        minHeight: '580px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '48px',
        background: '#F5EFE0',
        position: 'relative'
      }}>
        {/* Rough Border around inner content */}
        <RoughBorder roughness={1.0} strokeWidth={2.0} stroke="#4A4A6A" borderRadius={12} />

        {/* Small Doodle Decorations */}
        <svg style={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, transform: 'rotate(15deg)', pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                stroke="#FFE66D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className="pulse-star" />
        </svg>

        <svg style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, pointerEvents: 'none', opacity: 0.4, zIndex: 0 }} viewBox="0 0 40 40" fill="none">
          <circle cx="8" cy="32" r="4" fill="#4ECDC4" />
          <circle cx="20" cy="20" r="4" fill="#4ECDC4" />
          <circle cx="32" cy="8" r="4" fill="#4ECDC4" />
        </svg>

        <svg style={{ position: 'absolute', top: '50%', left: 20, transform: 'translateY(-50%)', width: 20, height: 40, pointerEvents: 'none', opacity: 0.3, zIndex: 0 }} viewBox="0 0 20 40" fill="none">
          <path d="M10 0 C -5 10, 25 20, 10 30 C -5 40, 25 50, 10 60" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <style>{`
          @keyframes pulseStar {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          .pulse-star {
            animation: pulseStar 2s infinite ease-in-out;
          }
        `}</style>

        {/* LEFT COLUMN */}
        <div style={{
          flex: '0 0 50%',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          position: 'relative',
          zIndex: 1
        }}>
          <RobotScene />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}>
          <FileInfoCard 
            fileName={file?.name || 'Unknown File'}
            fileSize={file?.size || 0}
            transactionType={transactionType}
            hasError={hasError}
          />
          <ParseLog 
            isLoading={isLoading}
            hasError={hasError}
            onRetry={parseFile}
            onComplete={() => navigate('/dashboard')}
            transactionType={transactionType}
          />
        </div>

      </div>
    </div>
  );
}

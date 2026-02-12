import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 'lg' }) => {
  const modalRoot = document.getElementById('modal-root');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalRoot) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
    }
  }, [modalRoot]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (overlayRef.current && event.target === overlayRef.current) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4"
      onClick={handleOverlayClick}
    >
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} m-auto flex flex-col max-h-full`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-grow overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end p-4 border-t border-gray-200 space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById('modal-root') || document.body);
};

export default Modal;

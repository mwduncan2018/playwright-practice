import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { CloseButton, Toast, ToastContainer } from 'react-bootstrap';

type Variant = 'success' | 'warning' | 'danger';
type Notify = (text: string, variant?: Variant) => void;

interface Message {
  id: number;
  text: string;
  variant: Variant;
}

const ToastContext = createContext<Notify>(() => {});
let nextId = 1;

/** Short messages in the bottom corner after something is saved or fails. Each hides after 6 seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const notify = useCallback<Notify>((text, variant = 'success') => {
    setMessages((current) => [...current, { id: nextId++, text, variant }]);
  }, []);
  const dismiss = (id: number) => setMessages((current) => current.filter((message) => message.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="bottom-end" containerPosition="fixed" className="p-3" data-testid="toast-container">
        {messages.map((message) => (
          <Toast
            key={message.id}
            bg={message.variant}
            onClose={() => dismiss(message.id)}
            delay={6000}
            autohide
            data-testid="toast"
          >
            {/* The X written out, as Toast.Header would render it, so it can carry a test ID. */}
            <Toast.Header closeButton={false}>
              <strong className="me-auto">Super Portal</strong>
              <CloseButton aria-label="Close" onClick={() => dismiss(message.id)} data-testid="toast-close-button" />
            </Toast.Header>
            <Toast.Body className={message.variant === 'warning' ? 'text-dark' : 'text-white'} data-testid="toast-message">
              {message.text}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast(): Notify {
  return useContext(ToastContext);
}

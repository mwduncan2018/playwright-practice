import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

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
      <ToastContainer position="bottom-end" containerPosition="fixed" className="p-3">
        {messages.map((message) => (
          <Toast key={message.id} bg={message.variant} onClose={() => dismiss(message.id)} delay={6000} autohide>
            <Toast.Header>
              <strong className="me-auto">Super Catalog</strong>
            </Toast.Header>
            <Toast.Body className={message.variant === 'warning' ? undefined : 'text-white'}>{message.text}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast(): Notify {
  return useContext(ToastContext);
}

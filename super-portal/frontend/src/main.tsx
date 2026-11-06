import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Container } from 'react-bootstrap';
import { BrowserRouter } from 'react-router';

import App from './App';
import { AuthProvider, startAuth } from './auth';
import { ToastProvider } from './components/Toasts';

const root = createRoot(document.getElementById('root')!);

// Sign in first: startAuth sends the browser to Keycloak and only resolves once signed in.
startAuth().then(
  (auth) =>
    root.render(
      <StrictMode>
        <AuthProvider value={auth}>
          <ToastProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </StrictMode>,
    ),
  (error: unknown) =>
    root.render(
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading as="h1" className="h4">
            Super Portal couldn't sign you in
          </Alert.Heading>
          <p className="mb-0">
            {error instanceof Error ? error.message : 'Keycloak did not respond.'} Reload the page to try again.
          </p>
        </Alert>
      </Container>,
    ),
);

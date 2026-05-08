import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from '../App';

// Mockear los componentes hijos
vi.mock('../components/CreatorDashboard', () => ({
  default: () => <div data-testid="creator-dashboard">Creator Dashboard Mock</div>
}));

vi.mock('../components/AuditDashboard', () => ({
  default: () => <div data-testid="audit-dashboard">Audit Dashboard Mock</div>
}));

vi.mock('../components/DnaArchitect', () => ({
  default: () => <div data-testid="dna-architect">DNA Architect Mock</div>
}));

vi.mock('../components/LoginView', () => ({
  default: ({ onLogin }) => (
    <div data-testid="login-view">
      Login View Mock
      <button onClick={() => onLogin({ access_token: 'token123', role: 'creator' })}>
        Simulate Creator Login
      </button>
      <button onClick={() => onLogin({ access_token: 'token456', role: 'approver_a' })}>
        Simulate Approver A Login
      </button>
      <button onClick={() => onLogin({ access_token: 'token789', role: 'approver_b' })}>
        Simulate Approver B Login
      </button>
    </div>
  )
}));

describe('App RBAC Component', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('debería renderizar la pantalla de Login por defecto', () => {
    render(<App />);
    expect(screen.getByTestId('login-view')).toBeInTheDocument();
    expect(screen.queryByTestId('creator-dashboard')).not.toBeInTheDocument();
  });

  it('debería renderizar el CreatorDashboard cuando se inicia sesión como creador', () => {
    render(<App />);
    const loginButton = screen.getByText('Simulate Creator Login');
    
    // Simulate user login
    fireEvent.click(loginButton);

    expect(screen.getByTestId('creator-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('login-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('audit-dashboard')).not.toBeInTheDocument();
  });

  it('debería renderizar el DnaArchitect cuando se inicia sesión como aprobador A', () => {
    render(<App />);
    const loginButton = screen.getByText('Simulate Approver A Login');
    
    // Simulate user login
    fireEvent.click(loginButton);

    expect(screen.getByTestId('dna-architect')).toBeInTheDocument();
    expect(screen.queryByTestId('login-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('creator-dashboard')).not.toBeInTheDocument();
  });

  it('debería renderizar el AuditDashboard cuando se inicia sesión como aprobador B', () => {
    render(<App />);
    const loginButton = screen.getByText('Simulate Approver B Login');
    
    // Simulate user login
    fireEvent.click(loginButton);

    expect(screen.getByTestId('audit-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('login-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('creator-dashboard')).not.toBeInTheDocument();
  });
});

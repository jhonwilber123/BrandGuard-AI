import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginView from '../components/LoginView';

// Mockear el fetch global
global.fetch = vi.fn();

describe('LoginView Component', () => {
  it('debería renderizar el formulario correctamente', () => {
    render(<LoginView onLogin={() => {}} />);
    
    expect(screen.getByText('Acceso al Sistema')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. creador1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });

  it('debería llamar a onLogin con los datos correctos si la API responde bien', async () => {
    const mockOnLogin = vi.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fake_token', role: 'creator' })
    });

    render(<LoginView onLogin={mockOnLogin} />);

    // Rellenar formulario (vienen con valores por defecto creador1 / pwd)
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /Iniciando.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({ access_token: 'fake_token', role: 'creator' });
    });
  });

  it('debería mostrar mensaje de error si la API rechaza credenciales', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<LoginView onLogin={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales incorrectas o servidor no disponible./i)).toBeInTheDocument();
    });
  });
});

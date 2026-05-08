import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DnaArchitect from '../components/DnaArchitect';

global.fetch = vi.fn();

describe('DnaArchitect Component', () => {
  it('debería renderizar el formulario correctamente', () => {
    render(<DnaArchitect token="fake_token" />);
    
    expect(screen.getByText(/Brand DNA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Snack saludable de quinua')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Construir DNA \(RAG\)/i })).toBeInTheDocument();
  });

  it('debería hacer submit y mostrar el manual generado', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ generated_manual: 'Manual generado de prueba: Tono alegre.' })
    });

    render(<DnaArchitect token="fake_token" />);

    // Rellenar formulario
    fireEvent.change(screen.getByPlaceholderText('Ej. Snack saludable de quinua'), { target: { value: 'Bebida de soya' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Divertido pero corporativo'), { target: { value: 'Formal' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Gen Z, 18-24 años'), { target: { value: 'Adultos' } });
    fireEvent.change(screen.getByPlaceholderText('Ej. Sostenibilidad, Innovación, Rapidez'), { target: { value: 'Calidad' } });

    const submitButton = screen.getByRole('button', { name: /Construir DNA \(RAG\)/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /Generando e Inyectando/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Manual generado de prueba: Tono alegre.')).toBeInTheDocument();
    });
  });
});

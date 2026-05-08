import { useState } from 'react';

function DnaArchitect({ token }) {
  const [formData, setFormData] = useState({
    product_category: '',
    tone_of_voice: '',
    target_audience: '',
    core_values: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedManual, setGeneratedManual] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedManual(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/v1/dna/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al generar el ADN de la marca. Verifica permisos o conexión.');
      }

      const data = await response.json();
      setGeneratedManual(data.generated_manual);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h2>Brand DNA <span className="gradient-text">Architect</span></h2>
        <p>Define las reglas de la marca que alimentarán la Base de Datos Vectorial.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Formulario */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Parámetros de Marca</h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Categoría del Producto</label>
              <input 
                type="text" 
                name="product_category"
                placeholder="Ej. Snack saludable de quinua" 
                value={formData.product_category}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Tono de Voz</label>
              <input 
                type="text" 
                name="tone_of_voice"
                placeholder="Ej. Divertido pero corporativo" 
                value={formData.tone_of_voice}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Público Objetivo</label>
              <input 
                type="text" 
                name="target_audience"
                placeholder="Ej. Gen Z, 18-24 años" 
                value={formData.target_audience}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Valores Clave</label>
              <input 
                type="text" 
                name="core_values"
                placeholder="Ej. Sostenibilidad, Innovación, Rapidez" 
                value={formData.core_values}
                onChange={handleChange}
                required
                className="glass-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Generando e Inyectando en Vector DB...' : 'Construir DNA (RAG)'}
            </button>
            {error && <p className="error-text" style={{ marginTop: '0.5rem' }}>{error}</p>}
          </form>
        </div>

        {/* Resultado */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Manual Generado (RAG Context)</h3>
          {generatedManual ? (
            <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', color: '#a7f3d0', borderLeft: '4px solid #10b981' }}>
              {generatedManual}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              El manual aparecerá aquí y se guardará automáticamente en Supabase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DnaArchitect;

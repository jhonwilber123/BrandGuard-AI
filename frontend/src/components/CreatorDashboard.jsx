import { useState } from 'react';

const CreatorDashboard = ({ token }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    tone: 'Divertido pero profesional',
    target_audience: 'Gen Z',
    additional_instructions: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateContent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/v1/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al generar el contenido.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>✨ Creative Engine</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Define los parámetros. La IA consultará el manual de marca (RAG) antes de escribir.
        </p>

        <form onSubmit={generateContent}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Producto</label>
          <input 
            type="text" 
            name="product_name"
            value={formData.product_name} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Snack de quinua"
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tono</label>
          <select name="tone" value={formData.tone} onChange={handleChange}>
            <option value="Divertido pero profesional">Divertido pero profesional</option>
            <option value="Formal y corporativo">Formal y corporativo</option>
            <option value="Urgente y promocional">Urgente y promocional</option>
            <option value="Empático y cercano">Empático y cercano</option>
          </select>

          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Público Objetivo</label>
          <input 
            type="text" 
            name="target_audience"
            value={formData.target_audience} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Gen Z (18-24 años)"
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Instrucciones Adicionales (Opcional)</label>
          <textarea 
            name="additional_instructions"
            value={formData.additional_instructions} 
            onChange={handleChange} 
            rows="3"
            placeholder="No usar tecnicismos..."
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? 'Generando contenido...' : 'Generar Copy'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Resultados</h3>
        
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>Cargando inteligencia artificial...</div>
          </div>
        )}

        {!loading && !result && !error && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            El copy generado aparecerá aquí.
          </div>
        )}

        {result && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ID: {result.content_id}</span>
              <span className={`badge ${result.status === 'PENDING' ? 'danger' : 'success'}`}>
                {result.status}
              </span>
            </div>
            
            <div style={{ 
              flex: 1, 
              background: 'rgba(15, 23, 42, 0.6)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--glass-border)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              overflowY: 'auto'
            }}>
              {result.generated_text}
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.6; transform: scale(0.98); }
        }
      `}} />
    </div>
  );
};

export default CreatorDashboard;

import { useState } from 'react';

const AuditDashboard = ({ token, role }) => {
  const [productContext, setProductContext] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const auditImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Debes subir una imagen para auditar.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('product_context', productContext);
    formData.append('file', imageFile);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/v1/audit/audit-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No setear Content-Type, el navegador lo calcula para FormData
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar la auditoría multimodal.');
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
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel">
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>👁️ Governance Audit</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Sube un activo gráfico. El modelo de visión evaluará si cumple las reglas de la marca.
        </p>

        <form onSubmit={auditImage}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Contexto del Producto / Campaña</label>
          <input 
            type="text" 
            value={productContext} 
            onChange={(e) => setProductContext(e.target.value)} 
            required 
            placeholder="Ej: Campaña publicitaria para Gen Z en Instagram"
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Imagen a Auditar</label>
          <div style={{ 
            border: '2px dashed var(--glass-border)', 
            padding: '2rem', 
            borderRadius: '8px', 
            textAlign: 'center',
            marginBottom: '1.5rem',
            background: 'rgba(15, 23, 42, 0.4)'
          }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>🖼️</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Selecciona una imagen o arrástrala</span>
            </label>
            {imageFile && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{imageFile.name}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(to right, var(--accent-secondary), #d946ef)' }}>
            {loading ? 'Analizando píxeles...' : 'Ejecutar Auditoría Multimodal'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Vista Previa & Veredicto</h3>
        
        {preview && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
            <img src={preview} alt="Preview" style={{ maxHeight: '250px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)' }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>Procesando en Gemini Vision...</div>
          </div>
        )}

        {!loading && result && (
          <div className="animate-fade-in" style={{ padding: '1.5rem', background: result.is_approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: `1px solid ${result.is_approved ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>
                {result.is_approved ? '✅' : '❌'}
              </div>
              <h3 style={{ color: result.is_approved ? 'var(--success-color)' : 'var(--danger-color)' }}>
                {result.is_approved ? 'Aprobado' : 'Rechazado'}
              </h3>
            </div>
            
            <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
              <strong>Justificación de la IA:</strong><br/>
              {result.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;

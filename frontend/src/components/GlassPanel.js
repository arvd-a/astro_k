export default function GlassPanel({ children, className = '', padding = '24px', style = {} }) {
  return (
    <div 
      className={`glass-panel ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}

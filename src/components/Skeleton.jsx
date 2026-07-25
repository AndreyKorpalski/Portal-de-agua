const bar = (width, height = 12) => ({
  width,
  height,
  borderRadius: 6,
  background: 'oklch(91% 0.008 230)',
  animation: 'skeletonPulse 1.3s ease-in-out infinite',
});

export default function Skeleton({ rows = 5 }) {
  return (
    <div>
      <div style={{ ...bar('34%', 22), marginBottom: 20 }} />
      <div style={{ background: '#fff', border: '1px solid oklch(91% 0.008 230)', borderRadius: 14, padding: 18 }}>
        <div style={{ ...bar('100%', 14), marginBottom: 16, opacity: 0.4 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid oklch(96% 0.006 230)' }}>
            <div style={bar(26, 26)} />
            <div style={bar('22%')} />
            <div style={bar('16%')} />
            <div style={bar('14%')} />
            <div style={{ ...bar('10%'), marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

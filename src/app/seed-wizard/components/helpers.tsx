
import React, { useState } from 'react';

export function FolderNode({ name, node, pathSoFar, level, onSelect }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: '4px', 
          paddingLeft: `${level * 16 + 8}px`, 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: 'var(--app-text)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {expanded ? '📂' : '📁'} {name}
      </div>
      {expanded && (
        <div>
          {Object.keys(node).sort((a, b) => {
            const aIsFile = node[a]._isFile;
            const bIsFile = node[b]._isFile;
            if (aIsFile && !bIsFile) return 1;
            if (!aIsFile && bIsFile) return -1;
            return a.localeCompare(b);
          }).map(key => {
            if (key === '_isFile') return null;
            const item = node[key];
            if (item._isFile) {
              return (
                <div 
                  key={item.name}
                  onClick={() => onSelect(item.name)}
                  style={{ 
                    fontSize: '11px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '2px 4px',
                    paddingLeft: `${(level + 1) * 16 + 24}px`
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-blue-dark)'; e.currentTarget.style.color = 'var(--app-window-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text)'; }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
                  <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
                </div>
              );
            } else {
              return <FolderNode key={key} name={key} node={item} pathSoFar={pathSoFar + key + '/'} level={level + 1} onSelect={onSelect} />;
            }
          })}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ templates, onSelect }: { templates: any[], onSelect: (name: string) => void }) {
  const tree: any = {};
  templates.forEach(t => {
    const parts = t.name.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { _isFile: true, ...t };
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  });

  return (
    <div style={{ userSelect: 'none' }}>
      {Object.keys(tree).sort((a, b) => {
        const aIsFile = tree[a]._isFile;
        const bIsFile = tree[b]._isFile;
        if (aIsFile && !bIsFile) return 1;
        if (!aIsFile && bIsFile) return -1;
        return a.localeCompare(b);
      }).map(key => {
        if (key === '_isFile') return null;
        const item = tree[key];
        if (item._isFile) {
          return (
            <div 
              key={item.name}
              onClick={() => onSelect(item.name)}
              style={{ 
                fontSize: '11px', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '2px 4px',
                paddingLeft: `8px`
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-blue-dark)'; e.currentTarget.style.color = 'var(--app-window-bg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text)'; }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📄 {key}</span>
              <span style={{ color: '#888', marginLeft: '8px' }}>{item.sizeKb} KB</span>
            </div>
          );
        } else {
          return <FolderNode key={key} name={key} node={item} pathSoFar={key + '/'} level={0} onSelect={onSelect} />;
        }
      })}
    </div>
  );
}

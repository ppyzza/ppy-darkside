import React from 'react';

type EntityFormProps = {
  entityName: string;
  entities: any[];
  formData: any;
  onChange: (data: any) => void;
  level?: number;
};

export const EntityForm: React.FC<EntityFormProps> = ({ entityName, entities, formData, onChange, level = 0 }) => {
  const entity = entities.find(e => e.className === entityName);
  
  if (!entity) return <div style={{ color: 'red' }}>Entity {entityName} not found.</div>;

  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleRelationChange = (relationProperty: string, idx: number, value: any) => {
    const arr = [...(formData[relationProperty] || [])];
    arr[idx] = value;
    onChange({ ...formData, [relationProperty]: arr });
  };

  const handleAddRelation = (relationProperty: string) => {
    const arr = [...(formData[relationProperty] || [])];
    arr.push({});
    onChange({ ...formData, [relationProperty]: arr });
  };

  const handleRemoveRelation = (relationProperty: string, idx: number) => {
    const arr = [...(formData[relationProperty] || [])];
    arr.splice(idx, 1);
    onChange({ ...formData, [relationProperty]: arr });
  };

  return (
    <div style={{ marginLeft: level * 16, borderLeft: '2px solid #ACA899', paddingLeft: '8px', marginBottom: '8px' }}>
      <h4 style={{ margin: '4px 0', fontSize: '12px', color: '#0A246A' }}>{entity.className} ({entity.tableName})</h4>
      
      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '8px' }}>
        {entity.columns.map((col: string) => {
          const isUuid = col.toLowerCase().includes('uuid') || col.toLowerCase().includes('id');
          return (
            <div key={col}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold' }}>{col}</label>
                {isUuid && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button className="btn" style={{ fontSize: '9px', padding: '1px 3px' }} onClick={() => {
                      const v4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                      });
                      handleFieldChange(col, v4);
                    }}>v4</button>
                    <button className="btn" style={{ fontSize: '9px', padding: '1px 3px' }} onClick={() => {
                      const ns = prompt('Enter a string seed for pseudo-UUID v5:');
                      if (ns) {
                        let hash = 0;
                        for (let i = 0; i < ns.length; i++) hash = Math.imul(31, hash) + ns.charCodeAt(i) | 0;
                        const hex = Math.abs(hash).toString(16).padStart(8, '0');
                        const v5 = `${hex}-xxxx-5xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
                          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                          return v.toString(16);
                        });
                        handleFieldChange(col, v5);
                      }
                    }}>v5</button>
                  </div>
                )}
              </div>
              {(() => {
                const isDate = col.toLowerCase().includes('date') || col.toLowerCase().endsWith('at');
                if (entity.enums && entity.enums[col]) {
                  const options = entity.enums[col];
                  return (
                    <select
                      style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #ACA899' }}
                      value={formData[col] || ''}
                      onChange={(e) => handleFieldChange(col, e.target.value)}
                    >
                      <option value="">-- Select Enum --</option>
                      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  );
                }

                if (isDate) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #ACA899' }}
                        value={formData[col] || ''}
                        onChange={(e) => handleFieldChange(col, e.target.value)}
                        placeholder="YYYY-MM-DD HH:mm:ss"
                      />
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input 
                          type="date" 
                          style={{ fontSize: '10px', padding: '1px' }}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            handleFieldChange(col, `${e.target.value} 00:00:00+00`);
                          }}
                        />
                        <button className="btn" style={{ fontSize: '9px', padding: '1px 3px' }} onClick={() => {
                          const d = formData[col] ? formData[col].split(' ')[0] : new Date().toISOString().split('T')[0];
                          handleFieldChange(col, `${d} 00:00:00+00`);
                        }}>UTC</button>
                        <button className="btn" style={{ fontSize: '9px', padding: '1px 3px' }} onClick={() => {
                          const d = formData[col] ? formData[col].split(' ')[0] : new Date().toISOString().split('T')[0];
                          handleFieldChange(col, `${d} 00:00:00+07`);
                        }}>GMT+7</button>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '2px', fontSize: '11px', border: '1px solid #ACA899' }}
                    value={formData[col] || ''}
                    onChange={(e) => handleFieldChange(col, e.target.value)}
                  />
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Relations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entity.relations.map((rel: any) => {
          if (rel.type === 'OneToMany') {
            const arr = formData[rel.property] || [];
            return (
              <div key={rel.property} style={{ background: '#F0F0F0', padding: '8px', border: '1px solid #EBEBEB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{rel.property} (1:N {rel.target})</span>
                  <button className="btn" style={{ fontSize: '10px' }} onClick={() => handleAddRelation(rel.property)}>+ Add</button>
                </div>
                {arr.map((item: any, idx: number) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <button 
                      style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10, fontSize: '10px' }} 
                      onClick={() => handleRemoveRelation(rel.property, idx)}
                    >
                      X
                    </button>
                    <EntityForm 
                      entityName={rel.target} 
                      entities={entities} 
                      formData={item} 
                      onChange={(data) => handleRelationChange(rel.property, idx, data)} 
                      level={level + 1}
                    />
                  </div>
                ))}
              </div>
            );
          } else if (rel.type === 'ManyToOne') {
            return (
              <div key={rel.property} style={{ background: '#E5F5E5', padding: '8px', border: '1px solid #EBEBEB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{rel.property} (N:1 {rel.target})</span>
                  {formData[rel.property] ? (
                    <button className="btn" style={{ fontSize: '10px' }} onClick={() => handleFieldChange(rel.property, undefined)}>- Remove</button>
                  ) : (
                    <button className="btn" style={{ fontSize: '10px' }} onClick={() => handleFieldChange(rel.property, {})}>+ Setup</button>
                  )}
                </div>
                {formData[rel.property] && (
                  <EntityForm 
                    entityName={rel.target} 
                    entities={entities} 
                    formData={formData[rel.property]} 
                    onChange={(data) => handleFieldChange(rel.property, data)} 
                    level={level + 1}
                  />
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

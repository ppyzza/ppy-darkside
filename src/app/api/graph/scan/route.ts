import { NextResponse } from 'next/server';
import { Project } from 'ts-morph';
import fs from 'fs';
import dagre from 'dagre';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repoPath, mode = 'micro' } = body;

    if (!repoPath) {
      return NextResponse.json({ error: 'repoPath is required' }, { status: 400 });
    }

    console.log(`Scanning repository [${mode}]: ${repoPath}`);

    const nodesMap = new Map<string, any>();
    const edgesMap = new Map<string, any>();

    if (mode === 'macro') {
      // Macro View: Scan top-level apps and libs directories
      const appsPath = `${repoPath}/apps`;
      const libsPath = `${repoPath}/libs`;

      let x = 0;
      let y = 0;

      if (fs.existsSync(appsPath)) {
        const apps = fs.readdirSync(appsPath).filter(f => !f.startsWith('.'));
        apps.forEach((app, i) => {
          nodesMap.set(`APP_${app}`, {
            id: `APP_${app}`,
            type: 'customNode',
            data: { label: app, nodeType: 'Application', file: `${appsPath}/${app}` },
            position: { x: (i % 4) * 200, y: Math.floor(i / 4) * 150 },
          });
        });
      }

      if (fs.existsSync(libsPath)) {
        const libs = fs.readdirSync(libsPath).filter(f => !f.startsWith('.'));
        libs.forEach((lib, i) => {
          nodesMap.set(`LIB_${lib}`, {
            id: `LIB_${lib}`,
            type: 'customNode',
            data: { label: lib, nodeType: 'Library', file: `${libsPath}/${lib}` },
            position: { x: (i % 6) * 200, y: 300 + Math.floor(i / 6) * 150 },
          });
        });
      }

      return NextResponse.json({
        nodes: Array.from(nodesMap.values()),
        edges: [],
      });
    }

    const project = new Project();
    
    // Scan all TypeScript files in the provided path
    project.addSourceFilesAtPaths(`${repoPath}/**/*.ts`);

    const sourceFiles = project.getSourceFiles();
    console.log(`Found ${sourceFiles.length} source files.`);

    for (const sf of sourceFiles) {
      const filePath = sf.getFilePath();
      // Skip test files and type definitions
      if (filePath.includes('.spec.ts') || filePath.includes('.test.ts') || filePath.includes('.d.ts')) {
        continue;
      }

      const classes = sf.getClasses();
      for (const c of classes) {
        const name = c.getName();
        if (!name) continue;

        const decorators = c.getDecorators().map(d => d.getName());
        
        let type = 'Unknown';
        if (decorators.includes('Controller')) type = 'Controller';
        else if (decorators.includes('Injectable')) type = 'Service';
        else if (decorators.includes('Entity')) type = 'Entity';
        else if (decorators.includes('Module')) type = 'Module';
        else if (decorators.includes('CommandHandler')) type = 'CommandHandler';
        else if (decorators.includes('EventsHandler')) type = 'EventHandler';
        else if (decorators.includes('Resolver')) type = 'Resolver';

        // Only include classes with relevant decorators for the architecture graph
        if (type === 'Unknown') continue;

        nodesMap.set(name, {
          id: name,
          type: 'customNode', // We will use a custom node in ReactFlow
          data: { label: name, nodeType: type, file: filePath },
          position: { x: Math.random() * 800, y: Math.random() * 600 }, // Initial random position, will be laid out by UI
        });

        // Extract API Endpoints for Controllers
        if (type === 'Controller') {
          let basePath = '';
          const controllerDecorator = c.getDecorator('Controller');
          if (controllerDecorator) {
            const args = controllerDecorator.getArguments();
            if (args.length > 0) {
              basePath = args[0].getText().replace(/['"]/g, '');
            }
          }

          const methods = c.getMethods();
          for (const method of methods) {
            const methodDecorators = method.getDecorators();
            for (const md of methodDecorators) {
              const mdName = md.getName();
              if (['Get', 'Post', 'Put', 'Delete', 'Patch'].includes(mdName)) {
                let subPath = '';
                const args = md.getArguments();
                if (args.length > 0) {
                  // Sometimes it's an object, we only care if it's a string path
                  const argText = args[0].getText().replace(/['"]/g, '');
                  if (!argText.startsWith('{')) {
                    subPath = argText;
                  }
                }
                
                const fullPath = `${mdName.toUpperCase()} /${basePath}${basePath && subPath ? '/' : ''}${subPath}`.replace(/\/\//g, '/');
                
                // Extract Payloads and Logic
                const params = method.getParameters().map(p => p.getText());
                const bodyText = method.getBodyText() || '';
                const methodName = method.getName();

                const endpointId = `API_${fullPath}`;
                nodesMap.set(endpointId, {
                  id: endpointId,
                  type: 'customNode',
                  data: { 
                    label: fullPath, 
                    nodeType: 'Endpoint', 
                    file: filePath,
                    methodName,
                    payloads: params,
                    logicSnippet: bodyText
                  },
                  position: { x: 0, y: 0 },
                });

                const edgeId = `${endpointId}->${name}`;
                edgesMap.set(edgeId, {
                  id: edgeId,
                  source: endpointId,
                  target: name,
                  label: 'ROUTES_TO',
                  type: 'smoothstep',
                });
              }
            }
          }
        }

        const constructors = c.getConstructors();
        for (const ctor of constructors) {
          const params = ctor.getParameters();
          for (const param of params) {
            const paramTypeNode = param.getTypeNode();
            if (paramTypeNode) {
              const paramTypeName = paramTypeNode.getText();
              
              if (paramTypeName.startsWith('Repository<')) {
                const entityMatch = paramTypeName.match(/Repository<([\w]+)>/);
                if (entityMatch) {
                  const entityName = entityMatch[1];
                  const edgeId = `${name}->${entityName}`;
                  edgesMap.set(edgeId, {
                    id: edgeId,
                    source: name,
                    target: entityName,
                    label: 'USES_REPO',
                    type: 'smoothstep',
                    animated: true,
                  });
                }
              } else {
                 const edgeId = `${name}->${paramTypeName}`;
                 edgesMap.set(edgeId, {
                    id: edgeId,
                    source: name,
                    target: paramTypeName,
                    label: 'INJECTS',
                    type: 'smoothstep',
                 });
              }
            }
          }
        }
      }
    }

    // Clean up edges that point to non-existent nodes (e.g. built-in types or external libs)
    const validEdges = Array.from(edgesMap.values()).filter(edge => nodesMap.has(edge.target));
    const validNodes = Array.from(nodesMap.values());

    // --- Backend Dagre Layout Calculation ---
    // We calculate layout on the backend to prevent freezing the browser tab for massive graphs (1000+ nodes)
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({ rankdir: 'TB' });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    validNodes.forEach(node => {
      dagreGraph.setNode(node.id, { width: 180, height: 60 });
    });

    validEdges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    if (validNodes.length > 0 && validEdges.length > 0) {
      dagre.layout(dagreGraph);
      validNodes.forEach(node => {
        const nodeWithPos = dagreGraph.node(node.id);
        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';
        node.position = {
          x: nodeWithPos.x - 180 / 2,
          y: nodeWithPos.y - 60 / 2,
        };
      });
    }

    return NextResponse.json({
      nodes: validNodes,
      edges: validEdges,
    });
  } catch (error: any) {
    console.error('Error scanning AST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

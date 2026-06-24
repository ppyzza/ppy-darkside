import { NextResponse } from 'next/server';
import fs from 'fs';
import { Project, SyntaxKind } from 'ts-morph';

export async function POST(req: Request) {
  try {
    const { dirPath } = await req.json();
    if (!dirPath || !fs.existsSync(dirPath)) {
      return NextResponse.json({ success: false, error: 'Invalid directory path' }, { status: 400 });
    }

    const project = new Project();
    // Add all .entity.ts files in the directory recursively
    project.addSourceFilesAtPaths(`${dirPath.replace(/\/$/, '')}/**/*.entity.ts`);

    const entities: any[] = [];

    for (const sourceFile of project.getSourceFiles()) {
      for (const classDeclaration of sourceFile.getClasses()) {
        const entityDecorator = classDeclaration.getDecorator('Entity');
        if (entityDecorator) {
          let tableName = classDeclaration.getName() || 'UnknownTable';
          
          // Try to extract table name from @Entity('tableName') or @Entity({ name: 'tableName' })
          const args = entityDecorator.getArguments();
          if (args.length > 0) {
            const firstArg = args[0];
            if (firstArg.getKind() === SyntaxKind.StringLiteral) {
              tableName = firstArg.getText().replace(/['"]/g, '');
            } else if (firstArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
              const nameProp = (firstArg as any).getProperty('name');
              if (nameProp && nameProp.getInitializer) {
                tableName = nameProp.getInitializer().getText().replace(/['"]/g, '');
              }
            }
          }

          const columns: string[] = [];
          const relations: any[] = [];
          const enums: Record<string, string[]> = {};
          let primaryKey = 'id';

          const getAllProperties = (cls: any): any[] => {
            let props = cls.getProperties();
            const base = cls.getBaseClass();
            if (base) {
              props = [...props, ...getAllProperties(base)];
            }
            return props;
          };

          for (const prop of getAllProperties(classDeclaration)) {
            const decorators = prop.getDecorators();
            for (const dec of decorators) {
              const name = dec.getName();
              
              if (name === 'PrimaryGeneratedColumn' || name === 'PrimaryColumn') {
                primaryKey = prop.getName();
                columns.push(prop.getName());
              } else if (name === 'Column' || name === 'CreateDateColumn' || name === 'UpdateDateColumn' || name === 'DeleteDateColumn') {
                columns.push(prop.getName());
                
                // Check for enum
                const args = dec.getArguments();
                if (args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression) {
                  const enumProp = (args[0] as any).getProperty('enum');
                  if (enumProp && enumProp.getInitializer) {
                    const enumName = enumProp.getInitializer().getText();
                    const enumDecl = project.getSourceFiles().flatMap(f => f.getEnums()).find(e => e.getName() === enumName);
                    if (enumDecl) {
                      enums[prop.getName()] = enumDecl.getMembers().map(m => m.getValue() as string || m.getName());
                    } else if (enumProp.getInitializer().getKind() === SyntaxKind.ArrayLiteralExpression) {
                      // Some enums are defined inline like `enum: ['A', 'B']`
                      const elements = (enumProp.getInitializer() as any).getElements();
                      enums[prop.getName()] = elements.map((e: any) => e.getText().replace(/['"]/g, ''));
                    }
                  }
                }

              } else if (name === 'ManyToOne' || name === 'OneToMany' || name === 'OneToOne' || name === 'ManyToMany') {
                const relArgs = dec.getArguments();
                let target = '';
                if (relArgs.length > 0) {
                  const targetArg = relArgs[0].getText(); // e.g. "() => User" or "type => User"
                  const match = targetArg.match(/=>\s*(\w+)/);
                  if (match) {
                    target = match[1];
                  }
                }
                
                // Only push ManyToOne and OneToMany for the builder POC
                if (name === 'ManyToOne' || name === 'OneToMany') {
                  relations.push({
                    type: name,
                    target,
                    property: prop.getName()
                  });
                }
              }
            }
          }

          entities.push({
            className: classDeclaration.getName(),
            tableName,
            file: sourceFile.getFilePath(),
            columns,
            enums,
            relations,
            primaryKey
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: entities });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

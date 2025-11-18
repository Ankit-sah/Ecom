const fs = require('fs');
const path = require('path');

// Create .prisma/client directory
const prismaClientDir = path.join(process.cwd(), '.prisma', 'client');
const generatedClientDir = path.join(process.cwd(), 'node_modules', '.prisma', 'client');

fs.mkdirSync(prismaClientDir, { recursive: true });

// Copy all files from generated client to .prisma/client
if (fs.existsSync(generatedClientDir)) {
  const files = fs.readdirSync(generatedClientDir);
  files.forEach(file => {
    const srcPath = path.join(generatedClientDir, file);
    const destPath = path.join(prismaClientDir, file);
    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    } else if (stat.isDirectory()) {
      // Recursively copy directories
      const copyDir = (src, dest) => {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        entries.forEach(entry => {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        });
      };
      copyDir(srcPath, destPath);
    }
  });
  
  // Fix paths in client.ts to point to the copied location instead of node_modules
  const clientTsPath = path.join(prismaClientDir, 'client.ts');
  if (fs.existsSync(clientTsPath)) {
    let clientContent = fs.readFileSync(clientTsPath, 'utf8');
    // Replace node_modules/.prisma/client paths with .prisma/client
    clientContent = clientContent.replace(
      /node_modules\/\.prisma\/client/g,
      '.prisma/client'
    );
    // Also fix process.cwd() references if needed
    clientContent = clientContent.replace(
      /path\.join\(process\.cwd\(\), "node_modules\/\.prisma\/client/g,
      'path.join(process.cwd(), ".prisma/client'
    );
    fs.writeFileSync(clientTsPath, clientContent);
  }
  
  // Create default.ts that exports from local files (not node_modules)
  const defaultTs = `export * from './client';
export * from './models';
export * from './enums';
`;
  
  // Create default.js - at runtime, require from node_modules (where the actual generated client is)
  // TypeScript will use default.d.ts which points to local .prisma/client files
  const defaultJs = `// Runtime bridge to Prisma client
// At runtime, Node.js requires the actual generated client from node_modules
// During build, TypeScript uses default.d.ts which points to .prisma/client
module.exports = require('../../node_modules/.prisma/client/client');
`;
  
  // Create default.d.ts - must properly export all types including PrismaClient
  // Use a more explicit export to ensure TypeScript can resolve PrismaClient
  const defaultDts = `export * from './client';
export * from './models';
export * from './enums';
export { PrismaClient } from './client';
export type { PrismaClient } from './client';
`;
  
  fs.writeFileSync(path.join(prismaClientDir, 'default.ts'), defaultTs);
  fs.writeFileSync(path.join(prismaClientDir, 'default.js'), defaultJs);
  fs.writeFileSync(path.join(prismaClientDir, 'default.d.ts'), defaultDts);
  
  // Copy all client files to @prisma/client/.prisma/client so TypeScript can resolve them
  // This is needed because @prisma/client/default.d.ts exports from '.prisma/client/default'
  // which TypeScript resolves relative to @prisma/client package
  const prismaPackageDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  const prismaPackagePrismaDir = path.join(prismaPackageDir, '.prisma', 'client');
  fs.mkdirSync(prismaPackagePrismaDir, { recursive: true });
  
  // Copy all files from .prisma/client to @prisma/client/.prisma/client
  const copyAllFiles = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyAllFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  copyAllFiles(prismaClientDir, prismaPackagePrismaDir);
  
  // Also update @prisma/client/default.d.ts to directly export from the copied files
  // This ensures TypeScript can resolve PrismaClient even with bundler module resolution
  const prismaDefaultDtsPath = path.join(prismaPackageDir, 'default.d.ts');
  if (fs.existsSync(prismaDefaultDtsPath)) {
    const directExport = `export * from './.prisma/client/default';
export { PrismaClient } from './.prisma/client/client';
export type { PrismaClient } from './.prisma/client/client';
`;
    fs.writeFileSync(prismaDefaultDtsPath, directExport);
  }
  
  console.log('✓ Copied Prisma client files to .prisma/client and @prisma/client/.prisma/client');
} else {
  console.error('✗ Generated Prisma client not found at', generatedClientDir);
  process.exit(1);
}


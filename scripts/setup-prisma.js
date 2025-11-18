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
  
  // Create default.d.ts
  const defaultDts = defaultTs;
  
  fs.writeFileSync(path.join(prismaClientDir, 'default.ts'), defaultTs);
  fs.writeFileSync(path.join(prismaClientDir, 'default.js'), defaultJs);
  fs.writeFileSync(path.join(prismaClientDir, 'default.d.ts'), defaultDts);
  
  // Create symlink in @prisma/client package so it can find .prisma/client
  const prismaPackageDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  const prismaPackagePrismaDir = path.join(prismaPackageDir, '.prisma');
  fs.mkdirSync(prismaPackagePrismaDir, { recursive: true });
  const symlinkPath = path.join(prismaPackagePrismaDir, 'client');
  if (fs.existsSync(symlinkPath)) {
    fs.unlinkSync(symlinkPath);
  }
  fs.symlinkSync(path.relative(prismaPackagePrismaDir, prismaClientDir), symlinkPath, 'dir');
  
  console.log('✓ Copied Prisma client files to .prisma/client and created symlink');
} else {
  console.error('✗ Generated Prisma client not found at', generatedClientDir);
  process.exit(1);
}


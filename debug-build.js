#!/usr/bin/env node

// Debug script for Next.js build issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js Build Debugger\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('');

// Check if .env files exist
console.log('📁 Environment Files:');
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
envFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${file}: ${exists ? '✅' : '❌'}`);
  if (exists) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`  Contains ${lines.length} variables`);
  }
});
console.log('');

// Check build output
console.log('📦 Build Output:');
const buildDir = '.next';
if (fs.existsSync(buildDir)) {
  const stats = fs.statSync(buildDir);
  console.log(`Build directory exists: ✅ (${stats.mtime})`);
  
  // Check for common build artifacts
  const artifacts = ['static', 'server', 'standalone'];
  artifacts.forEach(artifact => {
    const artifactPath = path.join(buildDir, artifact);
    const exists = fs.existsSync(artifactPath);
    console.log(`  ${artifact}/: ${exists ? '✅' : '❌'}`);
  });
} else {
  console.log('Build directory: ❌ (Run npm run build first)');
}
console.log('');

// Check for common issues
console.log('🔧 Common Issues Check:');
const issues = [];

// Check for TypeScript errors
if (fs.existsSync('tsconfig.json')) {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('TypeScript: ✅ No errors');
  } catch (error) {
    console.log('TypeScript: ❌ Has errors');
    issues.push('TypeScript compilation errors');
  }
}

// Check for ESLint errors
try {
  execSync('npx next lint --dir .', { stdio: 'pipe' });
  console.log('ESLint: ✅ No errors');
} catch (error) {
  console.log('ESLint: ❌ Has errors');
  issues.push('ESLint errors');
}

// Check for missing dependencies
try {
  execSync('npm ls --depth=0', { stdio: 'pipe' });
  console.log('Dependencies: ✅ All installed');
} catch (error) {
  console.log('Dependencies: ❌ Missing packages');
  issues.push('Missing dependencies');
}

console.log('');

if (issues.length > 0) {
  console.log('⚠️  Issues Found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('✅ No obvious issues found');
}

console.log('\n🚀 Debug Commands:');
console.log('  npm run build:debug    - Build with debug output');
console.log('  npm run start:debug    - Start with debug output');
console.log('  npm run build:analyze  - Build with bundle analysis');
console.log('  DEBUG=* npm run build  - Verbose debug output');

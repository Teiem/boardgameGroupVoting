import { config } from 'telefunc'

config.disableNamingConvention = true; // Disable the default naming convention for Telefunc functions

// import so relefunc functions get bundled in to build dir that is moved to .netlify/server/
const modules = import.meta.glob('./routes/**/*.telefunc.ts', { eager: true });
console.info("modules loaded:", Object.keys(modules).length);
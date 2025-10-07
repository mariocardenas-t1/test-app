import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias['@component-library'] = path.resolve(
      __dirname,
      '../component_library/src/components'
    );
    config.resolve.alias['@component-context'] = path.resolve(
      __dirname,
      '../component_library/src/context'
    );
    config.resolve.alias['@component-services'] = path.resolve(
      __dirname,
      '../component_library/src/services'
    );
    return config;
  },
};

export default nextConfig;

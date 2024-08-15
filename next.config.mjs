/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, {buildId, dev, isServer, defaultLoaders}) => {
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return config
    }
};

export default nextConfig;

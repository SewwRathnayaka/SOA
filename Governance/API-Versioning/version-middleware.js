/**
 * API Versioning Middleware
 * Handles API version routing, deprecation warnings, and version management
 */

class VersionMiddleware {
    constructor() {
        this.supportedVersions = new Map();
        this.deprecatedVersions = new Map();
        this.versionEndpoints = new Map();
        this.initializeVersions();
    }

    /**
     * Initialize supported and deprecated versions
     */
    initializeVersions() {
        // Supported versions
        this.supportedVersions.set('v1', {
            version: '1.0.0',
            releaseDate: '2024-01-01',
            status: 'current',
            deprecationDate: null,
            sunsetDate: null
        });

        // Deprecated versions (example)
        this.deprecatedVersions.set('v0', {
            version: '0.9.0',
            releaseDate: '2023-12-01',
            status: 'deprecated',
            deprecationDate: '2024-06-01',
            sunsetDate: '2024-12-01'
        });
    }

    /**
     * Version routing middleware
     */
    versionRouter() {
        return (req, res, next) => {
            const version = this.extractVersion(req);
            const versionInfo = this.getVersionInfo(version);

            // Add version info to request
            req.apiVersion = version;
            req.versionInfo = versionInfo;

            // Check if version is supported
            if (!this.isVersionSupported(version)) {
                return res.status(400).json({
                    error: 'Unsupported API version',
                    requestedVersion: version,
                    supportedVersions: Array.from(this.supportedVersions.keys()),
                    message: 'Please use a supported API version'
                });
            }

            // Check if version is deprecated
            if (this.isVersionDeprecated(version)) {
                const deprecationInfo = this.deprecatedVersions.get(version);
                res.setHeader('API-Deprecation-Warning', 'true');
                res.setHeader('API-Deprecation-Date', deprecationInfo.deprecationDate);
                res.setHeader('API-Sunset-Date', deprecationInfo.sunsetDate);
                res.setHeader('API-Alternative-Version', this.getLatestVersion());
            }

            // Add version headers to response
            res.setHeader('API-Version', versionInfo.version);
            res.setHeader('API-Status', versionInfo.status);

            next();
        };
    }

    /**
     * Extract version from request
     */
    extractVersion(req) {
        // Try URL path first: /api/v1/orders
        const pathMatch = req.path.match(/\/api\/v(\d+)/);
        if (pathMatch) {
            return `v${pathMatch[1]}`;
        }

        // Try Accept header: application/vnd.api+json;version=1
        const acceptHeader = req.headers.accept;
        if (acceptHeader) {
            const versionMatch = acceptHeader.match(/version=(\d+)/);
            if (versionMatch) {
                return `v${versionMatch[1]}`;
            }
        }

        // Try custom header: X-API-Version
        const customHeader = req.headers['x-api-version'];
        if (customHeader) {
            return customHeader.startsWith('v') ? customHeader : `v${customHeader}`;
        }

        // Default to latest version
        return this.getLatestVersion();
    }

    /**
     * Get version information
     */
    getVersionInfo(version) {
        return this.supportedVersions.get(version) || 
               this.deprecatedVersions.get(version) || 
               { version: 'unknown', status: 'unsupported' };
    }

    /**
     * Check if version is supported
     */
    isVersionSupported(version) {
        return this.supportedVersions.has(version) || this.deprecatedVersions.has(version);
    }

    /**
     * Check if version is deprecated
     */
    isVersionDeprecated(version) {
        return this.deprecatedVersions.has(version);
    }

    /**
     * Get latest supported version
     */
    getLatestVersion() {
        const versions = Array.from(this.supportedVersions.keys());
        return versions[versions.length - 1] || 'v1';
    }

    /**
     * Register version endpoints
     */
    registerVersionEndpoints(app, version, routes) {
        const versionPath = `/api/${version}`;
        app.use(versionPath, routes);
        this.versionEndpoints.set(version, versionPath);
        console.log(`[Version] Registered ${version} endpoints at ${versionPath}`);
    }

    /**
     * Get version statistics
     */
    getVersionStats() {
        return {
            supportedVersions: Array.from(this.supportedVersions.keys()),
            deprecatedVersions: Array.from(this.deprecatedVersions.keys()),
            totalVersions: this.supportedVersions.size + this.deprecatedVersions.size,
            latestVersion: this.getLatestVersion()
        };
    }

    /**
     * Add deprecation warning to response
     */
    addDeprecationWarning(res, version) {
        if (this.isVersionDeprecated(version)) {
            const deprecationInfo = this.deprecatedVersions.get(version);
            res.setHeader('Warning', `299 - "API version ${version} is deprecated. Sunset date: ${deprecationInfo.sunsetDate}"`);
        }
    }

    /**
     * Version compatibility checker
     */
    checkCompatibility(clientVersion, serverVersion) {
        const clientMajor = parseInt(clientVersion.replace('v', ''));
        const serverMajor = parseInt(serverVersion.replace('v', ''));

        if (clientMajor === serverMajor) {
            return { compatible: true, reason: 'Same major version' };
        } else if (clientMajor < serverMajor) {
            return { compatible: true, reason: 'Client version is older but compatible' };
        } else {
            return { compatible: false, reason: 'Client version is newer than server' };
        }
    }

    /**
     * Generate version migration guide
     */
    generateMigrationGuide(fromVersion, toVersion) {
        return {
            fromVersion,
            toVersion,
            migrationSteps: [
                '1. Review breaking changes documentation',
                '2. Update client code to use new API structure',
                '3. Test with new version in development',
                '4. Deploy to staging environment',
                '5. Monitor for issues',
                '6. Deploy to production'
            ],
            breakingChanges: this.getBreakingChanges(fromVersion, toVersion),
            newFeatures: this.getNewFeatures(fromVersion, toVersion),
            deprecationDate: this.deprecatedVersions.get(fromVersion)?.deprecationDate,
            sunsetDate: this.deprecatedVersions.get(fromVersion)?.sunsetDate
        };
    }

    /**
     * Get breaking changes between versions
     */
    getBreakingChanges(fromVersion, toVersion) {
        // This would be populated from a database or configuration
        return [
            'Changed response format for /orders endpoint',
            'Removed deprecated fields from payment response',
            'Updated authentication requirements'
        ];
    }

    /**
     * Get new features between versions
     */
    getNewFeatures(fromVersion, toVersion) {
        // This would be populated from a database or configuration
        return [
            'Added support for bulk operations',
            'New filtering options for orders',
            'Enhanced error reporting'
        ];
    }

    /**
     * Version health check endpoint
     */
    versionHealthCheck() {
        return (req, res) => {
            const stats = this.getVersionStats();
            res.json({
                status: 'healthy',
                versionInfo: stats,
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        };
    }

    /**
     * Version info endpoint
     */
    versionInfoEndpoint() {
        return (req, res) => {
            const version = req.apiVersion || this.getLatestVersion();
            const versionInfo = this.getVersionInfo(version);
            
            res.json({
                requestedVersion: version,
                versionInfo: versionInfo,
                supportedVersions: Array.from(this.supportedVersions.keys()),
                deprecatedVersions: Array.from(this.deprecatedVersions.keys()),
                latestVersion: this.getLatestVersion(),
                migrationGuide: version !== this.getLatestVersion() ? 
                    this.generateMigrationGuide(version, this.getLatestVersion()) : null
            });
        };
    }
}

module.exports = VersionMiddleware;

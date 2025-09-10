/**
 * SLA Monitoring System
 * Monitors service performance against defined SLA targets
 */

const EventEmitter = require('events');

class SLAMonitor extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.slaTargets = new Map();
        this.alerts = new Map();
        this.initializeSLATargets();
        this.startMonitoring();
    }

    /**
     * Initialize SLA targets for all services
     */
    initializeSLATargets() {
        const slaTargets = {
            'orders-service': {
                availability: 99.5,
                responseTime: 200, // ms
                errorRate: 0.1, // percentage
                throughput: 1000 // requests per minute
            },
            'payments-service': {
                availability: 99.9,
                responseTime: 150,
                errorRate: 0.05,
                throughput: 500
            },
            'shipping-service': {
                availability: 99.5,
                responseTime: 200,
                errorRate: 0.1,
                throughput: 300
            },
            'orchestrator-service': {
                availability: 99.9,
                responseTime: 100,
                errorRate: 0.05,
                throughput: 2000
            },
            'catalog-service': {
                availability: 99.5,
                responseTime: 300,
                errorRate: 0.1,
                throughput: 800
            }
        };

        Object.entries(slaTargets).forEach(([service, targets]) => {
            this.slaTargets.set(service, targets);
            this.metrics.set(service, {
                requests: [],
                errors: [],
                responseTimes: [],
                uptime: { start: Date.now(), downtime: 0 },
                lastHealthCheck: Date.now()
            });
        });
    }

    /**
     * Start monitoring services
     */
    startMonitoring() {
        // Health check every 30 seconds
        setInterval(() => {
            this.performHealthChecks();
        }, 30000);

        // SLA calculation every minute
        setInterval(() => {
            this.calculateSLAMetrics();
        }, 60000);

        // Alert check every 5 minutes
        setInterval(() => {
            this.checkSLAViolations();
        }, 300000);

        console.log('[SLA Monitor] Monitoring started');
    }

    /**
     * Record a request metric
     */
    recordRequest(serviceName, responseTime, statusCode, timestamp = Date.now()) {
        const serviceMetrics = this.metrics.get(serviceName);
        if (!serviceMetrics) return;

        const request = {
            timestamp,
            responseTime,
            statusCode,
            isError: statusCode >= 500
        };

        serviceMetrics.requests.push(request);
        serviceMetrics.responseTimes.push(responseTime);

        if (request.isError) {
            serviceMetrics.errors.push(request);
        }

        // Keep only last 1000 requests for memory management
        if (serviceMetrics.requests.length > 1000) {
            serviceMetrics.requests = serviceMetrics.requests.slice(-1000);
        }
        if (serviceMetrics.responseTimes.length > 1000) {
            serviceMetrics.responseTimes = serviceMetrics.responseTimes.slice(-1000);
        }
        if (serviceMetrics.errors.length > 100) {
            serviceMetrics.errors = serviceMetrics.errors.slice(-100);
        }

        // Check for immediate SLA violations
        this.checkImmediateViolations(serviceName, request);
    }

    /**
     * Perform health checks on all services
     */
    async performHealthChecks() {
        const services = Array.from(this.slaTargets.keys());
        
        for (const service of services) {
            try {
                const isHealthy = await this.checkServiceHealth(service);
                const serviceMetrics = this.metrics.get(service);
                
                if (!isHealthy) {
                    serviceMetrics.uptime.downtime += 30000; // 30 seconds downtime
                    this.emit('serviceDown', { service, timestamp: Date.now() });
                } else {
                    serviceMetrics.lastHealthCheck = Date.now();
                }
            } catch (error) {
                console.error(`[SLA Monitor] Health check failed for ${service}:`, error.message);
            }
        }
    }

    /**
     * Check individual service health
     */
    async checkServiceHealth(serviceName) {
        const healthUrls = {
            'orders-service': 'http://localhost:3000/health',
            'payments-service': 'http://localhost:3001/health',
            'shipping-service': 'http://localhost:3002/health',
            'orchestrator-service': 'http://localhost:3003/health',
            'catalog-service': 'http://localhost:8080/'
        };

        const url = healthUrls[serviceName];
        if (!url) return false;

        try {
            const axios = require('axios');
            const response = await axios.get(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Calculate SLA metrics for all services
     */
    calculateSLAMetrics() {
        const services = Array.from(this.slaTargets.keys());
        
        services.forEach(service => {
            const metrics = this.metrics.get(service);
            const targets = this.slaTargets.get(service);
            
            if (!metrics || !targets) return;

            // Calculate availability
            const totalTime = Date.now() - metrics.uptime.start;
            const availability = ((totalTime - metrics.uptime.downtime) / totalTime) * 100;

            // Calculate response time (95th percentile)
            const sortedResponseTimes = [...metrics.responseTimes].sort((a, b) => a - b);
            const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
            const responseTime95 = sortedResponseTimes[p95Index] || 0;

            // Calculate error rate
            const totalRequests = metrics.requests.length;
            const errorCount = metrics.errors.length;
            const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

            // Calculate throughput (requests per minute)
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            const recentRequests = metrics.requests.filter(req => req.timestamp > oneMinuteAgo);
            const throughput = recentRequests.length;

            // Store calculated metrics
            metrics.calculated = {
                availability,
                responseTime95,
                errorRate,
                throughput,
                timestamp: now
            };

            // Emit metrics update
            this.emit('metricsUpdate', {
                service,
                metrics: metrics.calculated,
                targets
            });
        });
    }

    /**
     * Check for SLA violations
     */
    checkSLAViolations() {
        const services = Array.from(this.slaTargets.keys());
        
        services.forEach(service => {
            const metrics = this.metrics.get(service);
            const targets = this.slaTargets.get(service);
            
            if (!metrics || !metrics.calculated || !targets) return;

            const violations = [];

            // Check availability
            if (metrics.calculated.availability < targets.availability) {
                violations.push({
                    metric: 'availability',
                    current: metrics.calculated.availability,
                    target: targets.availability,
                    severity: this.getSeverity(metrics.calculated.availability, targets.availability)
                });
            }

            // Check response time
            if (metrics.calculated.responseTime95 > targets.responseTime) {
                violations.push({
                    metric: 'responseTime',
                    current: metrics.calculated.responseTime95,
                    target: targets.responseTime,
                    severity: this.getSeverity(targets.responseTime, metrics.calculated.responseTime95)
                });
            }

            // Check error rate
            if (metrics.calculated.errorRate > targets.errorRate) {
                violations.push({
                    metric: 'errorRate',
                    current: metrics.calculated.errorRate,
                    target: targets.errorRate,
                    severity: this.getSeverity(targets.errorRate, metrics.calculated.errorRate)
                });
            }

            // Check throughput
            if (metrics.calculated.throughput > targets.throughput * 0.8) { // 80% threshold
                violations.push({
                    metric: 'throughput',
                    current: metrics.calculated.throughput,
                    target: targets.throughput,
                    severity: 'warning'
                });
            }

            if (violations.length > 0) {
                this.emit('slaViolation', {
                    service,
                    violations,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Check for immediate violations (real-time)
     */
    checkImmediateViolations(serviceName, request) {
        const targets = this.slaTargets.get(serviceName);
        if (!targets) return;

        // Check response time
        if (request.responseTime > targets.responseTime * 2) { // 2x threshold for immediate alert
            this.emit('immediateViolation', {
                service: serviceName,
                metric: 'responseTime',
                value: request.responseTime,
                threshold: targets.responseTime * 2,
                timestamp: request.timestamp
            });
        }

        // Check error rate (if error)
        if (request.isError) {
            this.emit('immediateViolation', {
                service: serviceName,
                metric: 'error',
                value: request.statusCode,
                threshold: '5xx',
                timestamp: request.timestamp
            });
        }
    }

    /**
     * Get severity level based on violation percentage
     */
    getSeverity(current, target) {
        const percentage = Math.abs((current - target) / target) * 100;
        
        if (percentage < 5) return 'warning';
        if (percentage < 10) return 'critical';
        return 'emergency';
    }

    /**
     * Get SLA report for a service
     */
    getSLAReport(serviceName) {
        const metrics = this.metrics.get(serviceName);
        const targets = this.slaTargets.get(serviceName);
        
        if (!metrics || !targets) {
            return { error: 'Service not found' };
        }

        return {
            service: serviceName,
            targets,
            current: metrics.calculated || {},
            compliance: this.calculateCompliance(metrics.calculated, targets),
            lastUpdated: metrics.calculated?.timestamp || null
        };
    }

    /**
     * Calculate SLA compliance percentage
     */
    calculateCompliance(current, targets) {
        if (!current) return 0;

        let compliance = 0;
        let totalMetrics = 0;

        // Availability compliance
        if (current.availability >= targets.availability) {
            compliance += 25;
        }
        totalMetrics += 25;

        // Response time compliance
        if (current.responseTime95 <= targets.responseTime) {
            compliance += 25;
        }
        totalMetrics += 25;

        // Error rate compliance
        if (current.errorRate <= targets.errorRate) {
            compliance += 25;
        }
        totalMetrics += 25;

        // Throughput compliance (not exceeding capacity)
        if (current.throughput <= targets.throughput) {
            compliance += 25;
        }
        totalMetrics += 25;

        return Math.round((compliance / totalMetrics) * 100);
    }

    /**
     * Get overall SLA dashboard data
     */
    getSLADashboard() {
        const services = Array.from(this.slaTargets.keys());
        const dashboard = {
            overall: {
                totalServices: services.length,
                compliantServices: 0,
                averageCompliance: 0
            },
            services: []
        };

        let totalCompliance = 0;

        services.forEach(service => {
            const report = this.getSLAReport(service);
            dashboard.services.push(report);
            
            if (report.compliance >= 95) {
                dashboard.overall.compliantServices++;
            }
            totalCompliance += report.compliance;
        });

        dashboard.overall.averageCompliance = Math.round(totalCompliance / services.length);

        return dashboard;
    }

    /**
     * Reset metrics for a service
     */
    resetMetrics(serviceName) {
        const metrics = this.metrics.get(serviceName);
        if (metrics) {
            metrics.requests = [];
            metrics.errors = [];
            metrics.responseTimes = [];
            metrics.uptime = { start: Date.now(), downtime: 0 };
            metrics.lastHealthCheck = Date.now();
            console.log(`[SLA Monitor] Metrics reset for ${serviceName}`);
        }
    }

    /**
     * Get alert history
     */
    getAlertHistory(serviceName, limit = 100) {
        // This would typically come from a database
        return this.alerts.get(serviceName) || [];
    }
}

module.exports = SLAMonitor;

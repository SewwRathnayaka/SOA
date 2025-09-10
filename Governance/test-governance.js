/**
 * Governance Framework Test Script
 * Demonstrates the governance framework functionality
 */

const GovernanceDashboard = require('./Governance-Framework/governance-dashboard');
const VersionMiddleware = require('./API-Versioning/version-middleware');
const SLAMonitor = require('./SLA-Monitoring/sla-monitor');
const DeprecationManager = require('./Deprecation-Schedules/deprecation-manager');

async function testGovernanceFramework() {
    console.log('=== SOA Governance Framework Test ===\n');
    
    // Initialize governance components
    console.log('1. Initializing Governance Components:');
    const dashboard = new GovernanceDashboard();
    const versionManager = new VersionMiddleware();
    const slaMonitor = new SLAMonitor();
    const deprecationManager = new DeprecationManager();
    console.log('✅ All components initialized\n');
    
    // Test API Versioning
    console.log('2. Testing API Versioning:');
    const versionStats = versionManager.getVersionStats();
    console.log('Version Statistics:', JSON.stringify(versionStats, null, 2));
    
    const compatibility = versionManager.checkCompatibility('v1', 'v2');
    console.log('Version Compatibility:', JSON.stringify(compatibility, null, 2));
    
    const migrationGuide = versionManager.generateMigrationGuide('v0', 'v1');
    console.log('Migration Guide:', JSON.stringify(migrationGuide, null, 2));
    console.log();
    
    // Test SLA Monitoring
    console.log('3. Testing SLA Monitoring:');
    
    // Simulate some requests
    slaMonitor.recordRequest('orders-service', 150, 200);
    slaMonitor.recordRequest('orders-service', 180, 200);
    slaMonitor.recordRequest('orders-service', 220, 500); // Error
    slaMonitor.recordRequest('payments-service', 120, 200);
    slaMonitor.recordRequest('payments-service', 140, 200);
    
    // Wait a moment for metrics to be calculated
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const slaReport = slaMonitor.getSLAReport('orders-service');
    console.log('Orders Service SLA Report:', JSON.stringify(slaReport, null, 2));
    
    const slaDashboard = slaMonitor.getSLADashboard();
    console.log('SLA Dashboard:', JSON.stringify(slaDashboard, null, 2));
    console.log();
    
    // Test Deprecation Management
    console.log('4. Testing Deprecation Management:');
    const deprecationSchedule = deprecationManager.getDeprecationSchedule();
    console.log('Deprecation Schedule:', JSON.stringify(deprecationSchedule, null, 2));
    
    const migrationTracking = deprecationManager.getMigrationTracking('orders-api');
    console.log('Migration Tracking (orders-api):', JSON.stringify(migrationTracking, null, 2));
    
    const deprecationDashboard = deprecationManager.getDeprecationDashboard();
    console.log('Deprecation Dashboard:', JSON.stringify(deprecationDashboard, null, 2));
    console.log();
    
    // Test Governance Dashboard
    console.log('5. Testing Governance Dashboard:');
    const governanceOverview = dashboard.getGovernanceDashboard();
    console.log('Governance Overview:', JSON.stringify(governanceOverview, null, 2));
    
    const governanceReport = dashboard.getGovernanceReport('monthly');
    console.log('Governance Report:', JSON.stringify(governanceReport, null, 2));
    console.log();
    
    // Test Service-Specific Governance
    console.log('6. Testing Service-Specific Governance:');
    const serviceGovernance = dashboard.getServiceGovernance('orders-service');
    console.log('Orders Service Governance:', JSON.stringify(serviceGovernance, null, 2));
    console.log();
    
    // Test Event Handling
    console.log('7. Testing Event Handling:');
    
    // Set up event listeners
    dashboard.on('governanceAlert', (alert) => {
        console.log('🚨 Governance Alert:', alert.type, 'for', alert.service);
    });
    
    slaMonitor.on('slaViolation', (violation) => {
        console.log('⚠️ SLA Violation:', violation.service, violation.violations);
    });
    
    deprecationManager.on('deprecationAnnounced', (deprecation) => {
        console.log('📢 Deprecation Announced:', deprecation.service, deprecation.version);
    });
    
    // Simulate some events
    slaMonitor.recordRequest('orders-service', 500, 500); // This should trigger an SLA violation
    console.log();
    
    // Test Governance Metrics
    console.log('8. Testing Governance Metrics:');
    dashboard.updateGovernanceMetrics('orders-service', {
        customMetric: 95,
        performance: 'excellent'
    });
    
    const updatedOverview = dashboard.getGovernanceDashboard();
    console.log('Updated Overview:', JSON.stringify(updatedOverview.overview, null, 2));
    console.log();
    
    // Test Recommendations and Action Items
    console.log('9. Testing Recommendations:');
    const report = dashboard.getGovernanceReport();
    console.log('Recommendations:', report.executiveSummary.recommendations);
    console.log('Action Items:', report.actionItems);
    console.log();
    
    console.log('=== Governance Framework Test Complete ===');
    console.log('\n📊 Summary:');
    console.log(`- Total Services: ${governanceOverview.overview.totalServices}`);
    console.log(`- Healthy Services: ${governanceOverview.overview.healthyServices}`);
    console.log(`- SLA Compliance: ${governanceOverview.overview.slaCompliance}%`);
    console.log(`- Active Deprecations: ${governanceOverview.overview.activeDeprecations}`);
    console.log(`- Overall Health: ${governanceOverview.overview.overallHealth}%`);
    console.log(`- Critical Alerts: ${governanceOverview.overview.criticalAlerts}`);
}

// Run the test
if (require.main === module) {
    testGovernanceFramework().catch(console.error);
}

module.exports = { testGovernanceFramework };

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Server, 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Wifi,
  WifiOff 
} from 'lucide-react';
import { checkBackendStatus } from '@/services/apiService';
import { toast } from 'sonner';

const BackendHealthMonitor = ({ className = "" }) => {
  const [healthStatus, setHealthStatus] = useState({
    express: null,
    python: null,
    loading: false,
    lastChecked: null,
  });

  const checkHealth = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const status = await checkBackendStatus();
      setHealthStatus({
        express: status.express,
        python: status.python,
        loading: false,
        lastChecked: new Date().toLocaleTimeString(),
        expressError: status.expressError,
        pythonError: status.pythonError,
      });
      
      if (!status.express || !status.python) {
        toast.warning('Some backend services are not responding');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        express: false,
        python: false,
        loading: false,
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message,
      });
      toast.error('Failed to check backend health');
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const ServiceStatus = ({ name, icon: Icon, status, description, color }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.icon}`} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === null ? (
          <Badge variant="outline" className="text-gray-500">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        ) : status ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        )}
      </div>
    </div>
  );

  const getOverallStatus = () => {
    if (healthStatus.express === null || healthStatus.python === null) {
      return { status: 'checking', color: 'text-gray-500', icon: RefreshCw };
    }
    if (healthStatus.express && healthStatus.python) {
      return { status: 'all systems operational', color: 'text-green-600', icon: Wifi };
    }
    if (healthStatus.express || healthStatus.python) {
      return { status: 'partial service available', color: 'text-yellow-600', icon: AlertCircle };
    }
    return { status: 'services unavailable', color: 'text-red-600', icon: WifiOff };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className={`p-6 border-0 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={healthStatus.loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <overallStatus.icon className={`w-4 h-4 ${overallStatus.color}`} />
        <span className={`font-medium capitalize ${overallStatus.color}`}>
          {overallStatus.status}
        </span>
        {healthStatus.lastChecked && (
          <span className="text-sm text-gray-500 ml-auto">
            Last checked: {healthStatus.lastChecked}
          </span>
        )}
      </div>

      {/* Service Details */}
      <div className="space-y-3">
        <ServiceStatus
          name="Express.js API"
          icon={Server}
          status={healthStatus.express}
          description="Main backend services, auth, jobs, companies"
          color={{
            bg: healthStatus.express ? 'bg-green-100' : 'bg-red-100',
            icon: healthStatus.express ? 'text-green-600' : 'text-red-600'
          }}
        />
        
        <ServiceStatus
          name="Python AI Service"
          icon={Brain}
          status={healthStatus.python}
          description="Resume analysis, career guidance, ML features"
          color={{
            bg: healthStatus.python ? 'bg-purple-100' : 'bg-red-100',
            icon: healthStatus.python ? 'text-purple-600' : 'text-red-600'
          }}
        />
      </div>

      {/* Error Details */}
      {(healthStatus.expressError || healthStatus.pythonError) && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Service Issues:</h4>
          <div className="text-xs text-red-700 space-y-1">
            {healthStatus.expressError && (
              <div>• Express API: {healthStatus.expressError.message || 'Connection failed'}</div>
            )}
            {healthStatus.pythonError && (
              <div>• Python AI: {healthStatus.pythonError.message || 'Connection failed'}</div>
            )}
          </div>
        </div>
      )}

      {/* Service Information */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Service Information:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• Express.js API: Handles authentication, job postings, and company management</div>
          <div>• Python AI Service: Provides resume analysis and career guidance features</div>
          <div>• Both services are required for full application functionality</div>
        </div>
      </div>
    </Card>
  );
};

export default BackendHealthMonitor;

import { 
    Activity, 
    Search, 
    Download,
    Clock,
    AlertCircle,
    CheckCircle,
    Info,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface ActivityLogEntry {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  category: string;
  details?: string;
}

export function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock data - in real app this would come from API
  const mockActivities: ActivityLogEntry[] = [
    {
      id: '1',
      type: 'success',
      message: 'Camera stream started successfully',
      timestamp: '2024-01-15T10:30:00Z',
      category: 'camera',
      details: 'Main Entrance Camera started streaming at 30 FPS'
    },
    {
      id: '2',
      type: 'info',
      message: 'User check-in detected',
      timestamp: '2024-01-15T10:28:00Z',
      category: 'attendance',
      details: 'John Doe checked in via Camera 1 with 95% confidence'
    },
    {
      id: '3',
      type: 'warning',
      message: 'Face recognition confidence low',
      timestamp: '2024-01-15T10:25:00Z',
      category: 'recognition',
      details: 'Camera 3 detected face but confidence was only 45%'
    },
    {
      id: '4',
      type: 'error',
      message: 'Camera connection failed',
      timestamp: '2024-01-15T10:20:00Z',
      category: 'camera',
      details: 'Camera 2 failed to connect to RTSP stream'
    },
    {
      id: '5',
      type: 'success',
      message: 'System backup completed',
      timestamp: '2024-01-15T10:00:00Z',
      category: 'system',
      details: 'Daily backup completed successfully. Size: 2.4GB'
    },
    {
      id: '6',
      type: 'info',
      message: 'New user registered',
      timestamp: '2024-01-15T09:45:00Z',
      category: 'user',
      details: 'Jane Smith was added to the system'
    },
    {
      id: '7',
      type: 'warning',
      message: 'High memory usage detected',
      timestamp: '2024-01-15T09:30:00Z',
      category: 'system',
      details: 'Memory usage reached 85% of available capacity'
    },
    {
      id: '8',
      type: 'success',
      message: 'Face recognition model updated',
      timestamp: '2024-01-15T09:00:00Z',
      category: 'recognition',
      details: 'Model accuracy improved to 98.5%'
    }
  ];

  const categories = ['all', 'camera', 'attendance', 'recognition', 'system', 'user'];
  const types = ['all', 'info', 'warning', 'error', 'success'];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Monitor system activities and events
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-sm font-medium mr-2">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mr-2">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              "border-l-4 p-4 rounded-r-lg border transition-colors",
              getTypeColor(activity.type)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getTypeIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{activity.message}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-muted rounded-full">
                      {activity.category}
                    </span>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.details}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
              ? 'No activities found' 
              : 'No activities yet'
            }
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Activity logs will appear here as the system runs.'
            }
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredActivities.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredActivities.length} of {mockActivities.length} activities
        </div>
      )}
    </div>
  );
}

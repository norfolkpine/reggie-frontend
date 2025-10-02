"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Shield, 
  Database, 
  Activity, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Bot,
  Workflow,
  FolderGit2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { KnowledgeBaseManager } from "@/features/knowledge-base/components/knowledge-base-manager";
import { FileManager } from "@/features/knowledge-base/components/file-manager";
import { adminService } from "@/api/admin";
import { TokenLogs } from "@/features/system/token-logs";
import { UserTokenSummary } from "@/features/system/user-token-summary";
import { ProjectsManager } from "@/features/vault/components/projects-manager";
import { VaultManager } from "@/features/vault/components/vault-file-manager";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalDocuments: number;
  totalAgents: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  lastBackup: string;
  uptime: string;
  totalKnowledgeBases: number;
  totalTeams: number;
}

interface UserActivity {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'admin' | 'user' | 'moderator';
}

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalDocuments: 0,
    totalAgents: 0,
    totalKnowledgeBases: 0,
    totalTeams: 0,
    systemStatus: 'healthy',
    lastBackup: '2024-01-15 02:00:00',
    uptime: '15 days, 8 hours'
  });

  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsExpanded, setCardsExpanded] = useState(true);

  useEffect(() => {
    // Fetch real data from admin service
    const fetchData = async () => {
      try {
        const [stats, activity, recent] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getUserActivity(),
          adminService.getRecentActivity(),
        ]);
        
        setSystemStats(stats);
        setUserActivity(activity);
        setRecentActivity(recent);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // Fallback to default values on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system health, manage users, and oversee operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(systemStats.systemStatus)}>
            {getStatusIcon(systemStats.systemStatus)}
            <span className="ml-1 capitalize">{systemStats.systemStatus}</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              // Re-fetch data
              const fetchData = async () => {
                try {
                  const [stats, activity, recent] = await Promise.all([
                    adminService.getSystemStats(),
                    adminService.getUserActivity(),
                    adminService.getRecentActivity(),
                  ]);
                  
                  setSystemStats(stats);
                  setUserActivity(activity);
                  setRecentActivity(recent);
                } catch (error) {
                  console.error('Failed to refresh admin data:', error);
                } finally {
                  setIsLoading(false);
                }
              };
              fetchData();
            }}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Key metrics and system statistics</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCardsExpanded(!cardsExpanded)}
              className="h-8 w-8 p-0"
            >
              {cardsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {cardsExpanded && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalUsers.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{isLoading ? (
                      <div className="animate-pulse bg-muted h-3 w-12 rounded inline-block" />
                    ) : (
                      systemStats.activeUsers
                    )} active today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalProjects
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalDocuments.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stored in vaults
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalAgents
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Active agents</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Knowledge Bases</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalKnowledgeBases || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Active knowledge bases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-16 rounded" />
                    ) : (
                      systemStats.totalTeams
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Active teams</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
          <TabsTrigger value="token-usage">Token Usage</TabsTrigger>
          {/* <TabsTrigger value="vault-files">Vault Files</TabsTrigger> */}
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground">{systemStats.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup</span>
                  <span className="text-sm text-muted-foreground">{systemStats.lastBackup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <span className="text-sm text-muted-foreground">{systemStats.activeUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse flex-1"></div>
                      <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                      <span className="text-sm">{activity.message}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Monitor and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                      <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge-base" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Base Management
              </CardTitle>
              <CardDescription>Manage knowledge bases and files</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
                </TabsList>
                <TabsContent value="files" className="space-y-4">
                  <FileManager />
                </TabsContent>
                <TabsContent value="knowledge-bases" className="space-y-4">
                  <KnowledgeBaseManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="token-usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Token Usage
              </CardTitle>
              <CardDescription>Track token usage and consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="log" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="log">Token logs</TabsTrigger>
                  <TabsTrigger value="total">Total Usage</TabsTrigger>
                </TabsList>
                <TabsContent value="total" className="space-y-4">
                  {/* TODO: Add token usage component */}
                  <UserTokenSummary />
                </TabsContent>
                <TabsContent value="log" className="space-y-4">
                  <TokenLogs />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="vault-files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Vault File Management
              </CardTitle>
              <CardDescription>Manage vault files and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                <TabsContent value="files" className="space-y-4">
                  <VaultManager />
                </TabsContent>
                <TabsContent value="projects" className="space-y-4">
                  <ProjectsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance and resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Administrative system operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Knowledge Base Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>Monitor security events and access patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-muted-foreground">Security Incidents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-muted-foreground">Successful Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-muted-foreground">Failed Attempts</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Recent Security Events</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>User authentication successful - john@example.com</span>
                    <span className="text-muted-foreground ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Admin login from trusted IP</span>
                    <span className="text-muted-foreground ml-auto">15 min ago</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>Multiple failed login attempts detected</span>
                    <span className="text-muted-foreground ml-auto">1 hour ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

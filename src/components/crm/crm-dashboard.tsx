'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  DollarSign,
  Calendar,
  CheckSquare,
  AlertCircle,
  Eye,
  FileText,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '@/lib/data';
import { AddClientSheet } from '@/components/clients/add-client-sheet';
import { AddProjectSheet } from '@/components/projects/add-project-sheet';
import { AddPaymentSheet } from '@/components/payments/add-payment-sheet';
import { CreateInvoiceDialog } from '@/components/invoices/create-invoice-dialog';
import { AddCommunicationLog } from '@/components/communications/add-communication-log';
import { AddTaskNote } from '@/components/tasks/add-task-note';

export function CRMDashboard() {
  const { 
    clients, 
    projects = [], 
    payments = [], 
    invoices = [], 
    communications = [], 
    tasks = [] 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');

  // Calculate metrics
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingInvoices = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0);

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;

  const recentCommunications = communications
    .sort((a, b) => new Date(b.communication_date).getTime() - new Date(a.communication_date).getTime())
    .slice(0, 5);

  const upcomingDeadlines = [
    ...projects.filter(p => p.end_date && new Date(p.end_date) > new Date()),
    ...tasks.filter(t => t.due_date && new Date(t.due_date) > new Date())
  ]
    .sort((a, b) => {
      const dateA = new Date('end_date' in a ? (a as any).end_date! : (a as any).due_date!);
      const dateB = new Date('end_date' in b ? (b as any).end_date! : (b as any).due_date!);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const topClients = clients
    .map(client => ({
      ...client,
      revenue: payments
        .filter(p => p.client_id === client.id && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div data-tour="crm" className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600">Manage your clients, projects, and business performance</p>
        </div>
        <div className="flex space-x-2">
          <AddClientSheet />
          <AddProjectSheet />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${outstandingInvoices.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'overdue').length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Communications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Communications</CardTitle>
                  <CardDescription>Latest client interactions</CardDescription>
                </div>
                <AddCommunicationLog />
              </CardHeader>
              <CardContent>
                {recentCommunications.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No communications logged yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCommunications.map((comm) => (
                      <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {comm.type}
                            </Badge>
                            <span className="text-sm font-medium">
                              {comm.subject || 'No subject'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {comm.content}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(comm.communication_date), 'MMM dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Projects and tasks due soon</CardDescription>
                </div>
                <AddTaskNote />
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming deadlines</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((item) => {
                      const isProject = 'end_date' in item;
                      const date = isProject ? (item as any).end_date! : (item as any).due_date!;
                      const isOverdue = new Date(date) < new Date();
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={isProject ? 'default' : 'secondary'}>
                                {isProject ? 'Project' : 'Task'}
                              </Badge>
                              <span className="text-sm font-medium">
                                {isProject ? (item as any).name : (item as any).title}
                              </span>
                            </div>
                            {isProject && item.description && (
                              <p className="text-sm text-gray-600 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                            {format(new Date(date), 'MMM dd')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>Your most valuable clients this period</CardDescription>
            </CardHeader>
            <CardContent>
              {topClients.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No client revenue data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.company && (
                            <p className="text-sm text-gray-500">{client.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${client.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {payments.filter(p => p.client_id === client.id).length} payments
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clients</CardTitle>
                <CardDescription>Manage your client relationships</CardDescription>
              </div>
              <AddClientSheet />
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first client</p>
                  <AddClientSheet />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => {
                      const clientRevenue = payments
                        .filter(p => p.client_id === client.id && p.status === 'paid')
                        .reduce((sum, p) => sum + p.amount, 0);
                      
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.company || '-'}</TableCell>
                          <TableCell>${clientRevenue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/dashboard/clients/${client.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Track project progress and milestones</CardDescription>
              </div>
              <AddProjectSheet />
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Create your first project to get started</p>
                  <AddProjectSheet />
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const progress = project.status === 'completed' ? 100 : 
                                   project.status === 'in_progress' ? 50 : 0;
                    
                    return (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge variant={
                            project.status === 'completed' ? 'default' :
                            project.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                          <span>Budget: {project.budget ? `$${project.budget.toFixed(2)}` : 'Not set'}</span>
                          {project.end_date && (
                            <span>Due: {format(new Date(project.end_date), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment records</CardDescription>
                </div>
                <AddPaymentSheet />
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-4">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                            <span className="font-medium">${payment.amount.toFixed(2)}</span>
                          </div>
                          {payment.description && (
                            <p className="text-sm text-gray-600">{payment.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(payment.payment_date), 'MMM dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoice activity</CardDescription>
                </div>
                <CreateInvoiceDialog />
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No invoices created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              invoice.status === 'paid' ? 'default' :
                              invoice.status === 'overdue' ? 'destructive' :
                              'secondary'
                            }>
                              {invoice.status}
                            </Badge>
                            <span className="font-medium">{invoice.invoice_number}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            ${invoice.total_amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(invoice.issue_date), 'MMM dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest CRM activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would show a timeline of recent activities */}
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Activity tracking coming soon</h3>
                  <p className="text-gray-500">View all your CRM activities in one place</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  DollarSign,
  Calendar,
  Check,
  PlusCircle,
  Edit
} from 'lucide-react';
import { useAppStore } from '@/lib/data';
import type { 
  Client, 
  Project, 
  ClientPayment, 
  ClientExpense, 
  Invoice, 
  CommunicationLog, 
} from '@/lib/types';

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients } = useAppStore();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    if (clientId) {
      const foundClient = clients.find(c => c.id === clientId);
      setClient(foundClient || null);
      
      // In a real app, these would be fetched from the database
      // For now, we'll use empty arrays as placeholders
      setProjects([]);
      setPayments([]);
      setExpenses([]);
      setInvoices([]);
      setCommunications([]);
    }
  }, [clientId, clients]);

  if (!client) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client not found</h2>
          <Link to="/dashboard/clients">
            <Button>Back to Clients</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.amount : sum, 0
  );
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstandingBalance = invoices.reduce((sum, invoice) => {
    if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
      return sum + (invoice.total_amount - (invoice.paid_amount || 0));
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            {client.company && (
              <p className="text-lg text-gray-600">{client.company}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>

      {/* Client Overview Cards */}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${outstandingBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.address}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <a 
                  href={client.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {client.website}
                </a>
              </div>
            )}
          </div>
          {client.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage client projects and milestones</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant={
                          project.status === 'completed' ? 'default' :
                          project.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {project.start_date && (
                          <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                        )}
                        {project.end_date && (
                          <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                        )}
                        {project.budget && (
                          <span>Budget: ${project.budget.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Track client payments and transactions</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No payments recorded yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Record First Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">${payment.amount.toFixed(2)}</h3>
                        <Badge variant={
                          payment.status === 'paid' ? 'default' :
                          payment.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Date: {new Date(payment.payment_date).toLocaleDateString()}</span>
                        {payment.payment_method && (
                          <span>Method: {payment.payment_method}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Track project-related expenses</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No expenses recorded yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Record First Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">${expense.amount.toFixed(2)}</h3>
                        <Badge variant="outline">{expense.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{expense.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                        {expense.vendor && (
                          <span>Vendor: {expense.vendor}</span>
                        )}
                        {expense.is_billable && (
                          <Badge variant="secondary">Billable</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage client invoices</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No invoices created yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{invoice.invoice_number}</h3>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'sent' ? 'secondary' :
                          invoice.status === 'overdue' ? 'destructive' :
                          'outline'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold">${invoice.total_amount.toFixed(2)}</span>
                        {invoice.paid_amount && invoice.paid_amount > 0 && (
                          <span className="text-sm text-gray-500">
                            Paid: ${invoice.paid_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Issue: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Communication Logs</CardTitle>
                <CardDescription>Track client interactions</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Log
              </Button>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No communication logs yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Log
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{comm.subject || comm.type}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{comm.type}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(comm.communication_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{comm.content}</p>
                      {comm.next_follow_up && (
                        <div className="mt-2 text-sm text-blue-600">
                          Follow up: {new Date(comm.next_follow_up).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks & Notes</CardTitle>
                <CardDescription>Manage client-related tasks and notes</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tasks yet</p>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {task.status}
                          </Badge>
                          {task.priority && (
                            <Badge variant="outline">{task.priority}</Badge>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      {task.due_date && (
                        <div className="text-sm text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Users, Building, Mail, Key, Plus, Trash2, Settings, ChartLine, Brain, Activity, Wand2 } from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon } from 'lucide-react';
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Customer {
  id: string;
  name: string;
  description?: string;
  vapiApiKey: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

interface EmailWhitelist {
  id: string;
  email: string;
  createdAt: string;
}

export default function AgencyPage() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerDescription, setNewCustomerDescription] = useState('');
  const [newCustomerApiKey, setNewCustomerApiKey] = useState('');
  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);

  // Redirect if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to super administrators.</p>
        </div>
      </div>
    );
  }

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/admin/customers'],
    enabled: isSuperAdmin,
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isSuperAdmin,
  });

  // Fetch email whitelist
  const { data: emailWhitelist, isLoading: emailLoading } = useQuery({
    queryKey: ['/api/admin/email-whitelist'],
    enabled: isSuperAdmin,
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; vapiApiKey: string }) => {
      const response = await apiRequest('POST', '/api/admin/customers', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Customer created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customers'] });
      setIsCreateCustomerOpen(false);
      setNewCustomerName('');
      setNewCustomerDescription('');
      setNewCustomerApiKey('');
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to create customer', variant: 'destructive' });
    },
  });

  // Add email to whitelist mutation
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/admin/email-whitelist', { email });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Email added to whitelist' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-whitelist'] });
      setIsAddEmailOpen(false);
      setNewWhitelistEmail('');
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add email to whitelist', variant: 'destructive' });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo - Left Aligned */}
            <div className="flex-shrink-0">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
            </div>
            
            {/* Navigation - Center */}
            <nav className="hidden md:flex space-x-8 mx-auto">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/bulk-analysis" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Brain size={16} />
                  <span>VoiceScope</span>
                </Link>
                <Link href="/assistant-studio" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Wand2 size={16} />
                  <span>Studio</span>
                </Link>
                <Link href="/agency" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                  <Building size={16} />
                  <span>Agency</span>
                </Link>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </Link>
            </nav>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Agency Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage customers, users, and system settings for the Invoxa.ai platform
          </p>
        </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="email-whitelist" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Whitelist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  Manage customer accounts and their Vapi API configurations
                </CardDescription>
              </div>
              <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add a new customer account with their Vapi API key
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerDescription">Description (Optional)</Label>
                      <Input
                        id="customerDescription"
                        value={newCustomerDescription}
                        onChange={(e) => setNewCustomerDescription(e.target.value)}
                        placeholder="Brief description of the customer"
                        data-testid="input-customer-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vapiApiKey">Vapi API Key</Label>
                      <Input
                        id="vapiApiKey"
                        type="password"
                        value={newCustomerApiKey}
                        onChange={(e) => setNewCustomerApiKey(e.target.value)}
                        placeholder="Enter Vapi API key"
                        data-testid="input-vapi-api-key"
                      />
                    </div>
                    <Button
                      onClick={() => createCustomerMutation.mutate({
                        name: newCustomerName,
                        description: newCustomerDescription,
                        vapiApiKey: newCustomerApiKey
                      })}
                      disabled={!newCustomerName || !newCustomerApiKey || createCustomerMutation.isPending}
                      className="w-full"
                      data-testid="button-create-customer"
                    >
                      {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-4">Loading customers...</div>
              ) : customers && customers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: Customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.description || '-'}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">
                            {customer.vapiApiKey ? '••••••••' : 'Not set'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No customers found. Create your first customer to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                            {user.role === 'super_admin' ? 'Super Admin' : 'Customer'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                            {user.emailVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No users found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-whitelist" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Whitelist</CardTitle>
                <CardDescription>
                  Control who can register on the platform by managing the email whitelist
                </CardDescription>
              </div>
              <Dialog open={isAddEmailOpen} onOpenChange={setIsAddEmailOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Email to Whitelist</DialogTitle>
                    <DialogDescription>
                      Allow this email address to register on the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="whitelistEmail">Email Address</Label>
                      <Input
                        id="whitelistEmail"
                        type="email"
                        value={newWhitelistEmail}
                        onChange={(e) => setNewWhitelistEmail(e.target.value)}
                        placeholder="user@example.com"
                        data-testid="input-whitelist-email"
                      />
                    </div>
                    <Button
                      onClick={() => addEmailMutation.mutate(newWhitelistEmail)}
                      disabled={!newWhitelistEmail || addEmailMutation.isPending}
                      className="w-full"
                      data-testid="button-add-email"
                    >
                      {addEmailMutation.isPending ? 'Adding...' : 'Add to Whitelist'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {emailLoading ? (
                <div className="text-center py-4">Loading email whitelist...</div>
              ) : emailWhitelist && emailWhitelist.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailWhitelist.map((item: EmailWhitelist) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.email}</TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No emails in whitelist. Add emails to allow user registration.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}
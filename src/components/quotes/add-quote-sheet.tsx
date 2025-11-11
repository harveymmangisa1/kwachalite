import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';

// --- Zod Schema for Quote --- //
const quoteItemSchema = z.object({
  product_id: z.number().optional(),
  product_name: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
});

const quoteSchema = z.object({
  quote_date: z.string().min(1, "Quote date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Invalid email address"),
  status: z.string().optional(),
  line_items: z.array(quoteItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

// --- AddQuoteSheet Component --- //
export function AddQuoteSheet() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quote_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client_name: '',
      client_email: '',
      status: 'draft',
      line_items: [{ product_name: '', quantity: 1, price: 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "line_items",
  });

  useEffect(() => {
    const fetchClientsAndProducts = async () => {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email');
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price');
      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
    };
    fetchClientsAndProducts();
  }, []);

  const handleClientSelection = (client: Client) => {
    setSelectedClient(client);
    form.setValue('client_name', client.name);
    form.setValue('client_email', client.email);
    setSearchTerm('');
  };

  const handleProductSelection = (index: number, product: Product) => {
    form.setValue(`line_items.${index}.product_id`, product.id);
    form.setValue(`line_items.${index}.product_name`, product.name);
    form.setValue(`line_items.${index}.price`, product.price);
  };

  const onSubmit = async (values: QuoteFormValues) => {
    const { error } = await supabase.from('quotes').insert([
      {
        ...values,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ]);

    if (error) {
      toast({
        title: 'Error creating quote',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Quote created successfully',
        description: `Quote for ${values.client_name} has been created.`,
      });
      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>Add Quote</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create New Quote</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          {/* Client Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quote_date">Quote Date</Label>
              <Input id="quote_date" type="date" {...form.register('quote_date')} />
              {form.formState.errors.quote_date && (
                <p className="text-red-500 text-sm">{form.formState.errors.quote_date.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" type="date" {...form.register('expiry_date')} />
              {form.formState.errors.expiry_date && (
                <p className="text-red-500 text-sm">{form.formState.errors.expiry_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="client_name">Client</Label>
            <Input
              id="client_name"
              placeholder="Search for a client or type a new name"
              {...form.register('client_name')}
              value={searchTerm || form.getValues('client_name')}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                form.setValue('client_name', e.target.value);
                setSelectedClient(null);
              }}
            />
            {searchTerm && (
              <div className="relative">
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto">
                  {clients
                    .filter((client) =>
                      client.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client) => (
                      <li
                        key={client.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleClientSelection(client)}
                      >
                        {client.name}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {form.formState.errors.client_name && (
              <p className="text-red-500 text-sm">{form.formState.errors.client_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="client_email">Client Email</Label>
            <Input id="client_email" placeholder="client@example.com" {...form.register('client_email')} />
            {form.formState.errors.client_email && (
              <p className="text-red-500 text-sm">{form.formState.errors.client_email.message}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <Label>Line Items</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-2 flex-grow">
                  <div>
                    <Label htmlFor={`line_items.${index}.product_name`} className="sr-only">Product</Label>
                    <Input
                      id={`line_items.${index}.product_name`}
                      placeholder="Product or service"
                      {...form.register(`line_items.${index}.product_name`)}
                      onChange={(e) => {
                        form.setValue(`line_items.${index}.product_name`, e.target.value);
                        // Handle custom product entry if needed
                      }}
                    />
                    {/* Add dropdown for product selection here */}
                  </div>
                  <div>
                    <Label htmlFor={`line_items.${index}.quantity`} className="sr-only">Quantity</Label>
                    <Input
                      id={`line_items.${index}.quantity`}
                      type="number"
                      placeholder="Quantity"
                      {...form.register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`line_items.${index}.price`} className="sr-only">Price</Label>
                    <Input
                      id={`line_items.${index}.price`}
                      type="number"
                      placeholder="Price"
                      {...form.register(`line_items.${index}.price`, { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ product_name: '', quantity: 1, price: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            {form.formState.errors.line_items && (
              <p className="text-red-500 text-sm">{form.formState.errors.line_items.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add any relevant notes here" {...form.register('notes')} />
          </div>

          {/* Status (Hidden) */}
          <Input type="hidden" {...form.register('status')} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Quote'}
            </Button>
          </div>
        </form>
        
        {/* Debugging Toast - Remove if not needed */}
        <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "You submitted the following values:",
                description: (
                  <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    {JSON.stringify(form.getValues(), null, 2)}
                  </pre>
                ),
              })
            }}
          >
            Show Form State
          </Button>

      </SheetContent>
    </Sheet>
  );
}

// --- Helper Functions and Error Display --- //
function ErrorMessage({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null;
}

// This is a new helper component for displaying toast notifications related to form submission.
// It centralizes the appearance of the toast for consistency.
const FormSubmissionToast = ({ title, description, variant }: {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}) => {
  const { toast } = useToast();
  
  useEffect(() => {
    toast({
      title,
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{description}</code>
        </pre>
      ),
      variant,
    });
  }, [title, description, variant, toast]);

  return null;
};

// This is an example of how you might use the FormSubmissionToast component.
// This is not a part of the AddQuoteSheet component, but is here for reference.
const ExampleUsage = () => {
  const [formValues, setFormValues] = useState<QuoteFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (values: QuoteFormValues) => {
    // In a real scenario, you would handle the submission here.
    // For this example, we'll just set the values to display in the toast.
    setFormValues(values);

    // You can also simulate an error.
    if (values.client_name.toLowerCase() === 'error') {
      setError("This is a simulated error.");
    } else {
      setError(null);
    }
  };

  return (
    <div>
      {formValues && !error && (
        <FormSubmissionToast
          title="Quote Submitted Successfully"
          description={JSON.stringify(formValues, null, 2)}
          variant="default"
        />
      )}
      {error && (
        <FormSubmissionToast
          title="Submission Error"
          description={`An error occurred: ${error}`}
          variant="destructive"
        />
      )}
      {/* Your form would go here, and its onSubmit would call handleFormSubmit */}
      <Button onClick={() => handleFormSubmit({ 
          quote_date: '2023-10-27', 
          expiry_date: '2023-11-26', 
          client_name: 'Test Client', 
          client_email: 'test@example.com', 
          status: 'draft', 
          line_items: [{ product_name: 'Test Product', quantity: 1, price: 100 }], 
          notes: 'Test notes' 
        })}>
        Simulate Successful Submission
      </Button>
      <Button onClick={() => handleFormSubmit({ 
          quote_date: '2023-10-27', 
          expiry_date: '2023-11-26', 
          client_name: 'error', 
          client_email: 'error@example.com', 
          status: 'draft', 
          line_items: [{ product_name: 'Error Product', quantity: 1, price: 0 }], 
          notes: 'Error notes' 
        })}>
        Simulate Error Submission
      </Button>
    </div>
  );
};

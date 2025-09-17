-- Create sales_receipts table
CREATE TABLE IF NOT EXISTS sales_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL,
    invoice_id UUID REFERENCES quotes(id), -- Can link to quotes table (used as invoices when status='accepted')
    quote_id UUID REFERENCES quotes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'card', 'bank_transfer', 'mobile_money', 'other')),
    reference_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, receipt_number)
);

-- Create delivery_notes table
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_number TEXT NOT NULL,
    invoice_id UUID REFERENCES quotes(id), -- Can link to quotes table (used as invoices when status='accepted')
    quote_id UUID REFERENCES quotes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB NOT NULL, -- Store quote items as JSON
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery', 'courier', 'shipping')),
    tracking_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    received_by TEXT,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, delivery_note_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_receipts_user_id ON sales_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_client_id ON sales_receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_date ON sales_receipts(date);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_invoice_id ON sales_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_quote_id ON sales_receipts(quote_id);

CREATE INDEX IF NOT EXISTS idx_delivery_notes_user_id ON delivery_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_client_id ON delivery_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_date ON delivery_notes(date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_delivery_date ON delivery_notes(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_invoice_id ON delivery_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_quote_id ON delivery_notes(quote_id);

-- Add RLS policies for sales_receipts
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales receipts" ON sales_receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales receipts" ON sales_receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales receipts" ON sales_receipts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales receipts" ON sales_receipts
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for delivery_notes
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery notes" ON delivery_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery notes" ON delivery_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own delivery notes" ON delivery_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own delivery notes" ON delivery_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_receipts_updated_at 
    BEFORE UPDATE ON sales_receipts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_notes_updated_at 
    BEFORE UPDATE ON delivery_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
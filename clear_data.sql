-- Clear all data except user credentials
-- This script preserves the users table and clears all business data

BEGIN;

-- Clear business data tables (in dependency order to avoid foreign key issues)
TRUNCATE TABLE public.customer_statement_lines CASCADE;
TRUNCATE TABLE public.bank_statement_transactions CASCADE;
TRUNCATE TABLE public.bank_statement_uploads CASCADE;
TRUNCATE TABLE public.revenue_uploads CASCADE;
TRUNCATE TABLE public.expense_transactions CASCADE;
TRUNCATE TABLE public.journal_entries CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.bills CASCADE;
TRUNCATE TABLE public.recurring_invoice_templates CASCADE;
TRUNCATE TABLE public.automated_jobs CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.vendors CASCADE;
TRUNCATE TABLE public.bank_accounts CASCADE;
TRUNCATE TABLE public.expense_categories CASCADE;
TRUNCATE TABLE public.chart_of_accounts CASCADE;
TRUNCATE TABLE public.companies CASCADE;

-- Clear session data (optional - uncomment if you want to clear sessions too)
-- TRUNCATE TABLE public.user_sessions CASCADE;
-- TRUNCATE TABLE public.sessions CASCADE;

-- Reset sequences (optional - uncomment if you want to reset IDs)
-- ALTER SEQUENCE public.companies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.customers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.vendors_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.bank_accounts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.invoices_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.bills_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.expense_transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.expense_categories_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.chart_of_accounts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.bank_statement_uploads_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.bank_statement_transactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.revenue_uploads_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.customer_statement_lines_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.journal_entries_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.recurring_invoice_templates_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.automated_jobs_id_seq RESTART WITH 1;

COMMIT;



--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    company_id integer NOT NULL,
    account_name text NOT NULL,
    account_number text,
    bank_name text,
    account_type text DEFAULT 'CHECKING'::text NOT NULL,
    current_balance numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    opening_balance numeric(10,2) DEFAULT 0.00,
    is_active boolean DEFAULT true
);


ALTER TABLE public.bank_accounts OWNER TO neondb_owner;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_id_seq OWNER TO neondb_owner;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: bank_statement_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bank_statement_transactions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    bank_account_id integer NOT NULL,
    bank_statement_upload_id integer NOT NULL,
    transaction_date date NOT NULL,
    description text NOT NULL,
    debit_amount numeric(10,2) DEFAULT 0.00,
    credit_amount numeric(10,2) DEFAULT 0.00,
    running_balance numeric(10,2) DEFAULT 0.00,
    category_id integer,
    customer_id integer,
    vendor_id integer,
    suggested_customer_id integer,
    suggested_vendor_id integer,
    suggested_category_id integer,
    is_reconciled boolean DEFAULT false,
    reconciled_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bank_statement_transactions OWNER TO neondb_owner;

--
-- Name: bank_statement_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bank_statement_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_statement_transactions_id_seq OWNER TO neondb_owner;

--
-- Name: bank_statement_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bank_statement_transactions_id_seq OWNED BY public.bank_statement_transactions.id;


--
-- Name: bank_statement_uploads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bank_statement_uploads (
    id integer NOT NULL,
    company_id integer NOT NULL,
    bank_account_id integer NOT NULL,
    file_name text NOT NULL,
    file_format text NOT NULL,
    upload_date timestamp without time zone DEFAULT now(),
    processed_date timestamp without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    total_rows integer,
    processed_rows integer,
    error_message text,
    created_at timestamp without time zone DEFAULT now(),
    csv_data text
);


ALTER TABLE public.bank_statement_uploads OWNER TO neondb_owner;

--
-- Name: bank_statement_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bank_statement_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_statement_uploads_id_seq OWNER TO neondb_owner;

--
-- Name: bank_statement_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bank_statement_uploads_id_seq OWNED BY public.bank_statement_uploads.id;


--
-- Name: bills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bills (
    id integer NOT NULL,
    company_id integer NOT NULL,
    vendor_id integer NOT NULL,
    bill_number text NOT NULL,
    bill_date date NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0.00,
    status text DEFAULT 'PENDING'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bills OWNER TO neondb_owner;

--
-- Name: bills_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bills_id_seq OWNER TO neondb_owner;

--
-- Name: bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bills_id_seq OWNED BY public.bills.id;


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chart_of_accounts (
    id integer NOT NULL,
    company_id integer NOT NULL,
    account_code text NOT NULL,
    account_name text NOT NULL,
    account_type text NOT NULL,
    parent_account_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chart_of_accounts OWNER TO neondb_owner;

--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.chart_of_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chart_of_accounts_id_seq OWNER TO neondb_owner;

--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.chart_of_accounts_id_seq OWNED BY public.chart_of_accounts.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    legal_entity_type text NOT NULL,
    tax_id text NOT NULL,
    registered_address text NOT NULL,
    default_currency text DEFAULT 'USD'::text NOT NULL,
    fiscal_year_start date NOT NULL,
    fiscal_year_end date NOT NULL,
    email text,
    phone text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: customer_statement_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_statement_lines (
    id integer NOT NULL,
    company_id integer NOT NULL,
    customer_id integer NOT NULL,
    line_date date NOT NULL,
    line_type text NOT NULL,
    description text NOT NULL,
    revenue numeric(10,2) DEFAULT 0.00,
    cost numeric(10,2) DEFAULT 0.00,
    netting_balance numeric(10,2) DEFAULT 0.00,
    debit_amount numeric(10,2) DEFAULT 0.00,
    credit_amount numeric(10,2) DEFAULT 0.00,
    running_balance numeric(10,2) DEFAULT 0.00,
    reference_number text,
    revenue_upload_id integer,
    bank_statement_upload_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    bank_statement_transaction_id integer
);


ALTER TABLE public.customer_statement_lines OWNER TO neondb_owner;

--
-- Name: customer_statement_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_statement_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_statement_lines_id_seq OWNER TO neondb_owner;

--
-- Name: customer_statement_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_statement_lines_id_seq OWNED BY public.customer_statement_lines.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    billing_address text,
    shipping_address text,
    payment_terms text DEFAULT 'Net 30'::text NOT NULL,
    opening_balance numeric(10,2) DEFAULT 0.00,
    opening_balance_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expense_categories (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    main_account_type text,
    detail_type text
);


ALTER TABLE public.expense_categories OWNER TO neondb_owner;

--
-- Name: expense_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.expense_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_categories_id_seq OWNER TO neondb_owner;

--
-- Name: expense_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.expense_categories_id_seq OWNED BY public.expense_categories.id;


--
-- Name: expense_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expense_transactions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    expense_category_id integer NOT NULL,
    transaction_date date NOT NULL,
    payee text NOT NULL,
    transaction_type text DEFAULT 'EXPENSE'::text NOT NULL,
    description text,
    amount_before_tax numeric(10,2) NOT NULL,
    sales_tax numeric(10,2) DEFAULT 0.00,
    total_amount numeric(10,2) NOT NULL,
    vendor_id integer,
    bill_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.expense_transactions OWNER TO neondb_owner;

--
-- Name: expense_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.expense_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_transactions_id_seq OWNER TO neondb_owner;

--
-- Name: expense_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.expense_transactions_id_seq OWNED BY public.expense_transactions.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    company_id integer NOT NULL,
    customer_id integer NOT NULL,
    invoice_number text NOT NULL,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0.00,
    status text DEFAULT 'PENDING'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.journal_entries (
    id integer NOT NULL,
    company_id integer NOT NULL,
    transaction_id integer NOT NULL,
    account_id integer NOT NULL,
    description text NOT NULL,
    debit_amount numeric(10,2) DEFAULT 0.00,
    credit_amount numeric(10,2) DEFAULT 0.00,
    entry_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.journal_entries OWNER TO neondb_owner;

--
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.journal_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entries_id_seq OWNER TO neondb_owner;

--
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.permissions OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: revenue_uploads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.revenue_uploads (
    id integer NOT NULL,
    company_id integer NOT NULL,
    file_name text NOT NULL,
    upload_date timestamp without time zone DEFAULT now(),
    processed_date timestamp without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    total_rows integer,
    processed_rows integer,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.revenue_uploads OWNER TO neondb_owner;

--
-- Name: revenue_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.revenue_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revenue_uploads_id_seq OWNER TO neondb_owner;

--
-- Name: revenue_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.revenue_uploads_id_seq OWNED BY public.revenue_uploads.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    transaction_number text NOT NULL,
    transaction_date date NOT NULL,
    transaction_type text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    customer_id integer,
    vendor_id integer,
    bank_account_id integer,
    category_id integer,
    is_reconciled boolean DEFAULT false,
    reconciled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO neondb_owner;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_role_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_role_assignments (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    role_id integer NOT NULL,
    company_id integer,
    assigned_by character varying,
    assigned_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true
);


ALTER TABLE public.user_role_assignments OWNER TO neondb_owner;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_role_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_role_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_role_assignments_id_seq OWNED BY public.user_role_assignments.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_system_role boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO neondb_owner;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO neondb_owner;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    session_token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password text,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    billing_address text,
    default_payment_method text DEFAULT 'Bank Transfer'::text,
    opening_balance numeric(10,2) DEFAULT 0.00,
    opening_balance_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: bank_statement_transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions ALTER COLUMN id SET DEFAULT nextval('public.bank_statement_transactions_id_seq'::regclass);


--
-- Name: bank_statement_uploads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_uploads ALTER COLUMN id SET DEFAULT nextval('public.bank_statement_uploads_id_seq'::regclass);


--
-- Name: bills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bills ALTER COLUMN id SET DEFAULT nextval('public.bills_id_seq'::regclass);


--
-- Name: chart_of_accounts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('public.chart_of_accounts_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: customer_statement_lines id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines ALTER COLUMN id SET DEFAULT nextval('public.customer_statement_lines_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: expense_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_categories ALTER COLUMN id SET DEFAULT nextval('public.expense_categories_id_seq'::regclass);


--
-- Name: expense_transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions ALTER COLUMN id SET DEFAULT nextval('public.expense_transactions_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: revenue_uploads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.revenue_uploads ALTER COLUMN id SET DEFAULT nextval('public.revenue_uploads_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user_role_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_role_assignments_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bank_accounts (id, company_id, account_name, account_number, bank_name, account_type, current_balance, created_at, updated_at, opening_balance, is_active) FROM stdin;
3	1	Test Bank	123456789	Test Bank	CHECKING	100.00	2025-07-16 14:39:23.62946	2025-07-16 14:39:23.62946	100.00	t
4	1	ABC Bank	0528994412	Airwallex	CHECKING	0.00	2025-07-16 14:46:22.902814	2025-07-16 14:46:22.902814	0.00	t
2	1	My Country Mobile PTE LTD	0528994412	OCBC Bank	CHECKING	8293.00	2025-07-09 14:08:35.898238	2025-07-18 05:43:43.073	100.00	t
\.


--
-- Data for Name: bank_statement_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bank_statement_transactions (id, company_id, bank_account_id, bank_statement_upload_id, transaction_date, description, debit_amount, credit_amount, running_balance, category_id, customer_id, vendor_id, suggested_customer_id, suggested_vendor_id, suggested_category_id, is_reconciled, reconciled_date, notes, created_at, updated_at) FROM stdin;
40	1	2	2	2025-03-14	Jane Smith - Payment Received	0.00	349.00	449.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:49.365963	2025-07-10 06:54:49.365963
39	1	2	2	2025-03-17	Michael Brown - Deposit	0.00	972.00	1421.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:49.273636	2025-07-10 06:54:49.273636
38	1	2	2	2025-03-20	ABC Corp - Office Supplies	602.00	0.00	819.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:49.180848	2025-07-10 06:54:49.180848
37	1	2	2	2025-03-21	John Doe - Payment Received	0.00	969.00	1788.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:49.088036	2025-07-10 06:54:49.088036
36	1	2	2	2025-03-26	John Doe - Payment Received	0.00	979.00	2767.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.996772	2025-07-10 06:54:48.996772
35	1	2	2	2025-03-28	Michael Brown - Deposit	0.00	142.00	2909.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.903863	2025-07-10 06:54:48.903863
34	1	2	2	2025-03-29	Green Energy - Consulting Fee	593.00	0.00	2316.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.811956	2025-07-10 06:54:48.811956
33	1	2	2	2025-04-03	Tech Solutions - Internet Bill	194.00	0.00	2122.00	1	\N	\N	\N	\N	\N	f	\N		2025-07-10 06:54:48.719423	2025-07-16 12:33:44.94
32	1	2	2	2025-04-04	Michael Brown - Refund	0.00	668.00	2790.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.627305	2025-07-10 06:54:48.627305
31	1	2	2	2025-04-05	Michael Brown - Deposit	0.00	909.00	3699.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.534616	2025-07-10 06:54:48.534616
30	1	2	2	2025-04-06	Tech Solutions - Software Subscription	460.00	0.00	3239.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.442704	2025-07-10 06:54:48.442704
29	1	2	2	2025-04-07	Chris Johnson - Deposit	0.00	836.00	4075.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.350288	2025-07-10 06:54:48.350288
28	1	2	2	2025-04-11	Michael Brown - Payment Received	0.00	357.00	4432.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.257957	2025-07-10 06:54:48.257957
27	1	2	2	2025-04-16	XYZ Ltd - Consulting Fee	384.00	0.00	4048.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.165229	2025-07-10 06:54:48.165229
26	1	2	2	2025-04-19	ABC Corp - Consulting Fee	671.00	0.00	3377.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:48.071886	2025-07-10 06:54:48.071886
25	1	2	2	2025-04-23	John Doe - Deposit	0.00	187.00	3564.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.978514	2025-07-10 06:54:47.978514
24	1	2	2	2025-04-27	Tech Solutions - Internet Bill	824.00	0.00	2740.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.887525	2025-07-10 06:54:47.887525
23	1	2	2	2025-05-02	Michael Brown - Payment Received	0.00	163.00	2903.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.794497	2025-07-10 06:54:47.794497
22	1	2	2	2025-05-07	Chris Johnson - Deposit	0.00	735.00	3638.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.70146	2025-07-10 06:54:47.70146
21	1	2	2	2025-05-12	Chris Johnson - Refund	0.00	575.00	4213.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.609313	2025-07-10 06:54:47.609313
20	1	2	2	2025-05-15	Jane Smith - Deposit	0.00	384.00	4597.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.516125	2025-07-10 06:54:47.516125
19	1	2	2	2025-05-20	Chris Johnson - Deposit	0.00	223.00	4820.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.423174	2025-07-10 06:54:47.423174
18	1	2	2	2025-05-25	John Doe - Payment Received	0.00	746.00	5566.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.331545	2025-07-10 06:54:47.331545
17	1	2	2	2025-05-26	Global Enterprises - Internet Bill	255.00	0.00	5311.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.237846	2025-07-10 06:54:47.237846
16	1	2	2	2025-05-27	Chris Johnson - Payment Received	0.00	682.00	5993.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.145518	2025-07-10 06:54:47.145518
15	1	2	2	2025-05-30	Jane Smith - Payment Received	0.00	161.00	6154.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:47.053006	2025-07-10 06:54:47.053006
14	1	2	2	2025-06-02	Emily Davis - Refund	0.00	377.00	6531.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.954953	2025-07-10 06:54:46.954953
13	1	2	2	2025-06-03	Tech Solutions - Office Supplies	993.00	0.00	5538.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.857993	2025-07-10 06:54:46.857993
12	1	2	2	2025-06-04	Tech Solutions - Consulting Fee	479.00	0.00	5059.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.761429	2025-07-10 06:54:46.761429
11	1	2	2	2025-06-08	Global Enterprises - Advertising	384.00	0.00	4675.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.667619	2025-07-10 06:54:46.667619
10	1	2	2	2025-06-09	Michael Brown - Payment Received	0.00	105.00	4780.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.573917	2025-07-10 06:54:46.573917
9	1	2	2	2025-06-13	XYZ Ltd - Office Supplies	575.00	0.00	4205.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.48052	2025-07-10 06:54:46.48052
8	1	2	2	2025-06-18	Chris Johnson - Refund	0.00	499.00	4704.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.387314	2025-07-10 06:54:46.387314
48	1	2	3	2025-06-18	QRS - Refund	0.00	499.00	5203.00	\N	12	\N	12	\N	\N	f	\N		2025-07-10 10:34:35.227778	2025-07-16 12:31:38.186
7	1	2	2	2025-06-22	XYZ Ltd - Software Subscription	731.00	0.00	4472.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.295866	2025-07-10 06:54:46.295866
47	1	2	3	2025-06-22	XYZ Ltd - Software Subscription	731.00	0.00	3741.00	\N	11	\N	11	\N	\N	f	\N		2025-07-10 10:34:35.133	2025-07-16 12:16:17.192
6	1	2	2	2025-06-24	John Doe - Deposit	0.00	344.00	4085.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.202043	2025-07-10 06:54:46.202043
46	1	2	3	2025-06-24	JKL - Deposit	0.00	344.00	4429.00	\N	16	\N	16	\N	\N	f	\N		2025-07-10 10:34:35.041701	2025-07-16 12:16:25.422
5	1	2	2	2025-06-27	Chris Johnson - Payment Received	0.00	297.00	4726.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.108336	2025-07-10 06:54:46.108336
45	1	2	3	2025-06-27	GHI - Payment Received	0.00	297.00	5023.00	\N	15	\N	15	\N	\N	f	\N		2025-07-10 10:34:34.949692	2025-07-14 18:45:53.072
4	1	2	2	2025-06-29	John Doe - Payment Received	0.00	802.00	5825.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:46.015728	2025-07-10 06:54:46.015728
44	1	2	3	2025-06-29	FK - Payment Received	0.00	802.00	6627.00	\N	4	\N	4	\N	\N	f	\N		2025-07-10 10:34:34.852291	2025-07-10 11:19:02.413
3	1	2	2	2025-07-03	John Doe - Refund	0.00	142.00	6769.00	\N	\N	\N	\N	\N	\N	f	\N	\N	2025-07-10 06:54:45.922191	2025-07-10 06:54:45.922191
43	1	2	3	2025-07-03	FK - Refund	0.00	142.00	6911.00	\N	4	\N	4	\N	\N	f	\N		2025-07-10 10:34:34.760229	2025-07-10 10:43:25.428
2	1	2	2	2025-07-06	Global Enterprises - Internet Bill	307.00	0.00	6604.00	1	\N	\N	\N	\N	\N	f	\N		2025-07-10 06:54:45.827308	2025-07-10 08:22:27.516
42	1	2	3	2025-07-06	DEF Enterprises - Internet Bill	307.00	0.00	6297.00	\N	14	\N	14	\N	10	f	\N		2025-07-10 10:34:34.668831	2025-07-13 06:05:54.966
1	1	2	2	2025-07-10	Emily Davis - Refund	0.00	998.00	7295.00	1	\N	\N	\N	\N	\N	f	\N		2025-07-10 06:54:45.728644	2025-07-10 09:32:24.308
41	1	2	3	2025-07-10	MCM - Refund	0.00	998.00	8293.00	1	2	\N	2	\N	\N	f	\N		2025-07-10 10:34:34.566656	2025-07-10 10:38:45.171
\.


--
-- Data for Name: bank_statement_uploads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bank_statement_uploads (id, company_id, bank_account_id, file_name, file_format, upload_date, processed_date, status, total_rows, processed_rows, error_message, created_at, csv_data) FROM stdin;
2	1	2	MCM OCBC Bank Statement.csv	CSV	2025-07-10 06:54:45.34604	2025-07-10 06:54:49.395	PROCESSED	40	40	\N	2025-07-10 06:54:45.34604	\N
3	1	2	MCM OCBC Bank Statement.csv	CSV	2025-07-10 10:34:34.257997	2025-07-10 10:34:35.256	PROCESSED	8	8	\N	2025-07-10 10:34:34.257997	\N
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bills (id, company_id, vendor_id, bill_number, bill_date, due_date, amount, paid_amount, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chart_of_accounts (id, company_id, account_code, account_name, account_type, parent_account_id, is_active, created_at, updated_at) FROM stdin;
1	1	1000	Cash	Asset	\N	t	2025-07-08 14:18:37.827953	2025-07-08 14:18:37.827953
2	1	1200	Accounts Receivable	Asset	\N	t	2025-07-08 14:18:37.881302	2025-07-08 14:18:37.881302
3	1	1500	Inventory	Asset	\N	t	2025-07-08 14:18:37.92571	2025-07-08 14:18:37.92571
4	1	1700	Equipment	Asset	\N	t	2025-07-08 14:18:37.970051	2025-07-08 14:18:37.970051
5	1	2000	Accounts Payable	Liability	\N	t	2025-07-08 14:18:38.014451	2025-07-08 14:18:38.014451
6	1	2100	Accrued Expenses	Liability	\N	t	2025-07-08 14:18:38.058984	2025-07-08 14:18:38.058984
7	1	3000	Owner's Equity	Equity	\N	t	2025-07-08 14:18:38.103147	2025-07-08 14:18:38.103147
8	1	4000	Sales Revenue	Revenue	\N	t	2025-07-08 14:18:38.1487	2025-07-08 14:18:38.1487
9	1	4100	Service Revenue	Revenue	\N	t	2025-07-08 14:18:38.192979	2025-07-08 14:18:38.192979
10	1	5000	Cost of Goods Sold	Expense	\N	t	2025-07-08 14:18:38.237614	2025-07-08 14:18:38.237614
11	1	6000	Office Supplies	Expense	\N	t	2025-07-08 14:18:38.281907	2025-07-08 14:18:38.281907
12	1	6100	Rent Expense	Expense	\N	t	2025-07-08 14:18:38.326052	2025-07-08 14:18:38.326052
13	1	6200	Utilities Expense	Expense	\N	t	2025-07-08 14:18:38.370326	2025-07-08 14:18:38.370326
14	1	6300	Travel Expense	Expense	\N	t	2025-07-08 14:18:38.414521	2025-07-08 14:18:38.414521
15	1	6400	Miscellaneous Expense	Expense	\N	t	2025-07-08 14:18:38.458702	2025-07-08 14:18:38.458702
16	2	1000	Cash	Asset	\N	t	2025-07-13 06:00:51.675776	2025-07-13 06:00:51.675776
17	2	1200	Accounts Receivable	Asset	\N	t	2025-07-13 06:00:51.726879	2025-07-13 06:00:51.726879
18	2	1500	Inventory	Asset	\N	t	2025-07-13 06:00:51.772303	2025-07-13 06:00:51.772303
19	2	1700	Equipment	Asset	\N	t	2025-07-13 06:00:51.817125	2025-07-13 06:00:51.817125
20	2	2000	Accounts Payable	Liability	\N	t	2025-07-13 06:00:51.86194	2025-07-13 06:00:51.86194
21	2	2100	Accrued Expenses	Liability	\N	t	2025-07-13 06:00:51.906647	2025-07-13 06:00:51.906647
22	2	3000	Owner's Equity	Equity	\N	t	2025-07-13 06:00:51.951223	2025-07-13 06:00:51.951223
23	2	4000	Sales Revenue	Revenue	\N	t	2025-07-13 06:00:51.996226	2025-07-13 06:00:51.996226
24	2	4100	Service Revenue	Revenue	\N	t	2025-07-13 06:00:52.041862	2025-07-13 06:00:52.041862
25	2	5000	Cost of Goods Sold	Expense	\N	t	2025-07-13 06:00:52.086796	2025-07-13 06:00:52.086796
26	2	6000	Office Supplies	Expense	\N	t	2025-07-13 06:00:52.130836	2025-07-13 06:00:52.130836
27	2	6100	Rent Expense	Expense	\N	t	2025-07-13 06:00:52.175574	2025-07-13 06:00:52.175574
28	2	6200	Utilities Expense	Expense	\N	t	2025-07-13 06:00:52.220738	2025-07-13 06:00:52.220738
29	2	6300	Travel Expense	Expense	\N	t	2025-07-13 06:00:52.265524	2025-07-13 06:00:52.265524
30	2	6400	Miscellaneous Expense	Expense	\N	t	2025-07-13 06:00:52.310215	2025-07-13 06:00:52.310215
31	3	1000	Cash	Asset	\N	t	2025-07-13 06:02:42.947122	2025-07-13 06:02:42.947122
32	3	1200	Accounts Receivable	Asset	\N	t	2025-07-13 06:02:42.98965	2025-07-13 06:02:42.98965
33	3	1500	Inventory	Asset	\N	t	2025-07-13 06:02:43.030443	2025-07-13 06:02:43.030443
34	3	1700	Equipment	Asset	\N	t	2025-07-13 06:02:43.071345	2025-07-13 06:02:43.071345
35	3	2000	Accounts Payable	Liability	\N	t	2025-07-13 06:02:43.112768	2025-07-13 06:02:43.112768
36	3	2100	Accrued Expenses	Liability	\N	t	2025-07-13 06:02:43.153827	2025-07-13 06:02:43.153827
37	3	3000	Owner's Equity	Equity	\N	t	2025-07-13 06:02:43.194564	2025-07-13 06:02:43.194564
38	3	4000	Sales Revenue	Revenue	\N	t	2025-07-13 06:02:43.236166	2025-07-13 06:02:43.236166
39	3	4100	Service Revenue	Revenue	\N	t	2025-07-13 06:02:43.275822	2025-07-13 06:02:43.275822
40	3	5000	Cost of Goods Sold	Expense	\N	t	2025-07-13 06:02:43.316504	2025-07-13 06:02:43.316504
41	3	6000	Office Supplies	Expense	\N	t	2025-07-13 06:02:43.357419	2025-07-13 06:02:43.357419
42	3	6100	Rent Expense	Expense	\N	t	2025-07-13 06:02:43.398295	2025-07-13 06:02:43.398295
43	3	6200	Utilities Expense	Expense	\N	t	2025-07-13 06:02:43.439141	2025-07-13 06:02:43.439141
44	3	6300	Travel Expense	Expense	\N	t	2025-07-13 06:02:43.47886	2025-07-13 06:02:43.47886
45	3	6400	Miscellaneous Expense	Expense	\N	t	2025-07-13 06:02:43.519695	2025-07-13 06:02:43.519695
46	4	1000	Cash	Asset	\N	t	2025-07-16 12:12:12.67964	2025-07-16 12:12:12.67964
47	4	1200	Accounts Receivable	Asset	\N	t	2025-07-16 12:12:12.767252	2025-07-16 12:12:12.767252
48	4	1500	Inventory	Asset	\N	t	2025-07-16 12:12:12.812223	2025-07-16 12:12:12.812223
49	4	1700	Equipment	Asset	\N	t	2025-07-16 12:12:12.856756	2025-07-16 12:12:12.856756
50	4	2000	Accounts Payable	Liability	\N	t	2025-07-16 12:12:12.901351	2025-07-16 12:12:12.901351
51	4	2100	Accrued Expenses	Liability	\N	t	2025-07-16 12:12:12.950613	2025-07-16 12:12:12.950613
52	4	3000	Owner's Equity	Equity	\N	t	2025-07-16 12:12:12.995572	2025-07-16 12:12:12.995572
53	4	4000	Sales Revenue	Revenue	\N	t	2025-07-16 12:12:13.041146	2025-07-16 12:12:13.041146
54	4	4100	Service Revenue	Revenue	\N	t	2025-07-16 12:12:13.085682	2025-07-16 12:12:13.085682
55	4	5000	Cost of Goods Sold	Expense	\N	t	2025-07-16 12:12:13.130393	2025-07-16 12:12:13.130393
56	4	6000	Office Supplies	Expense	\N	t	2025-07-16 12:12:13.174848	2025-07-16 12:12:13.174848
57	4	6100	Rent Expense	Expense	\N	t	2025-07-16 12:12:13.21945	2025-07-16 12:12:13.21945
58	4	6200	Utilities Expense	Expense	\N	t	2025-07-16 12:12:13.264033	2025-07-16 12:12:13.264033
59	4	6300	Travel Expense	Expense	\N	t	2025-07-16 12:12:13.307599	2025-07-16 12:12:13.307599
60	4	6400	Miscellaneous Expense	Expense	\N	t	2025-07-16 12:12:13.352107	2025-07-16 12:12:13.352107
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, name, legal_entity_type, tax_id, registered_address, default_currency, fiscal_year_start, fiscal_year_end, email, phone, created_at, updated_at) FROM stdin;
1	MCM	LLC	121313	P.O.Box 957,Road Town, Tortola,\nBritish Virgin Islands	USD	2025-03-31	2024-12-31	aayan@acepeakinvestment.com	08830868964	2025-07-08 14:18:37.772272	2025-07-08 14:18:37.772272
2	Test Company	LLC	12-3456789	123 Test St	USD	2025-01-01	2025-12-31	\N	\N	2025-07-13 06:00:51.580492	2025-07-13 06:00:51.580492
3	Ace Peak Investment	Corporation	121313	P.O.Box 957,Road Town, Tortola,\nBritish Virgin Islands	USD	2024-01-01	2024-12-31	aayan@acepeakinvestment.com	08830868964	2025-07-13 06:02:42.902621	2025-07-13 06:02:42.902621
4	ABC	Corporation	121212	Office No. 316-07, 3rd Floor\nHamsah Building, Zabeel Road Karama	USD	2025-01-14	2024-12-31	furqan@mycountrymobile.com	19174447881	2025-07-16 12:12:12.555603	2025-07-16 12:12:12.555603
\.


--
-- Data for Name: customer_statement_lines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_statement_lines (id, company_id, customer_id, line_date, line_type, description, revenue, cost, netting_balance, debit_amount, credit_amount, running_balance, reference_number, revenue_upload_id, bank_statement_upload_id, created_at, updated_at, bank_statement_transaction_id) FROM stdin;
1	1	2	2025-07-08	REVENUE	Revenue entry from Revenue Test.csv	2313.00	2939.00	-626.00	0.00	0.00	-626.00	\N	2	\N	2025-07-09 10:36:37.339804	2025-07-09 10:36:37.339804	\N
3	1	2	2025-07-08	REVENUE	Revenue entry from Revenue Test.csv	2313.00	2939.00	-626.00	0.00	0.00	-626.00	\N	3	\N	2025-07-09 10:48:30.248525	2025-07-09 10:48:30.248525	\N
5	1	2	2025-07-08	REVENUE	Revenue entry from Revenue Test.csv	2313.00	2939.00	-626.00	0.00	0.00	-626.00	\N	4	\N	2025-07-10 10:21:31.099545	2025-07-10 10:21:31.099545	\N
7	1	11	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	3421.00	1876.00	1545.00	0.00	0.00	1545.00	\N	4	\N	2025-07-10 10:21:31.340346	2025-07-10 10:21:31.340346	\N
8	1	12	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	1567.00	2345.00	-778.00	0.00	0.00	-778.00	\N	4	\N	2025-07-10 10:21:31.475612	2025-07-10 10:21:31.475612	\N
9	1	13	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	4789.00	921.00	3868.00	0.00	0.00	3868.00	\N	4	\N	2025-07-10 10:21:31.613949	2025-07-10 10:21:31.613949	\N
10	1	14	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	2893.00	3102.00	-209.00	0.00	0.00	-209.00	\N	4	\N	2025-07-10 10:21:31.749994	2025-07-10 10:21:31.749994	\N
11	1	15	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	4123.00	1678.00	2445.00	0.00	0.00	2445.00	\N	4	\N	2025-07-10 10:21:31.886326	2025-07-10 10:21:31.886326	\N
12	1	16	2025-07-09	REVENUE	Revenue entry from Revenue Test.csv	1954.00	2456.00	-502.00	0.00	0.00	-502.00	\N	4	\N	2025-07-10 10:21:32.023221	2025-07-10 10:21:32.023221	\N
13	1	2	2025-07-10	BANK_TRANSACTION	Bank Transaction: MCM - Refund	0.00	0.00	0.00	0.00	998.00	998.00	\N	\N	\N	2025-07-10 10:38:45.238842	2025-07-10 10:38:45.238842	41
14	1	4	2025-07-03	BANK_TRANSACTION	Bank Transaction: FK - Refund	0.00	0.00	0.00	0.00	142.00	142.00	\N	\N	\N	2025-07-10 10:43:25.504609	2025-07-10 10:43:25.504609	43
15	1	4	2025-06-29	BANK_TRANSACTION	Bank Transaction: FK - Payment Received	0.00	0.00	0.00	0.00	802.00	802.00	\N	\N	\N	2025-07-10 11:19:02.486904	2025-07-10 11:19:02.486904	44
16	1	14	2025-07-06	BANK_TRANSACTION	Bank Transaction: DEF Enterprises - Internet Bill	0.00	0.00	0.00	307.00	0.00	-307.00	\N	\N	\N	2025-07-13 06:05:55.040018	2025-07-13 06:05:55.040018	42
17	1	15	2025-06-27	BANK_TRANSACTION	Bank Transaction: GHI - Payment Received	0.00	0.00	0.00	0.00	297.00	297.00	\N	\N	\N	2025-07-14 18:45:53.155224	2025-07-14 18:45:53.155224	45
18	1	11	2025-06-22	BANK_TRANSACTION	Bank Transaction: XYZ Ltd - Software Subscription	0.00	0.00	0.00	731.00	0.00	2276.00	\N	\N	\N	2025-07-16 12:16:17.322547	2025-07-16 12:16:17.322547	47
19	1	16	2025-06-24	BANK_TRANSACTION	Bank Transaction: JKL - Deposit	0.00	0.00	0.00	0.00	344.00	-846.00	\N	\N	\N	2025-07-16 12:16:25.537173	2025-07-16 12:16:25.537173	46
20	1	12	2025-06-18	BANK_TRANSACTION	Bank Transaction: QRS - Refund	0.00	0.00	0.00	0.00	499.00	-1277.00	\N	\N	\N	2025-07-16 12:31:38.34446	2025-07-16 12:31:38.34446	48
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, company_id, name, contact_person, email, phone, billing_address, shipping_address, payment_terms, opening_balance, opening_balance_date, created_at, updated_at) FROM stdin;
1	1	Test Custimer	Furkan	fura@mcmc.omc	1292192121			Net 30	300.00	\N	2025-07-09 10:01:05.980777	2025-07-09 10:01:05.980777
2	1	MCM	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-09 10:36:37.290709	2025-07-09 10:36:37.290709
4	1	FK	DK2	hfhf@gmail.com	13131313			Net 60	0.00	\N	2025-07-09 16:58:15.176703	2025-07-09 16:58:15.176703
5	1	xyz	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:02.529852	2025-07-10 10:09:02.529852
6	1	qrs	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:02.97299	2025-07-10 10:09:02.97299
7	1	tuv	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:03.262922	2025-07-10 10:09:03.262922
8	1	def	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:03.544537	2025-07-10 10:09:03.544537
9	1	ghi	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:03.847966	2025-07-10 10:09:03.847966
10	1	jkl	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:09:04.134826	2025-07-10 10:09:04.134826
11	1	XYZ	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.292747	2025-07-10 10:21:31.292747
12	1	QRS	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.430239	2025-07-10 10:21:31.430239
13	1	TUV	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.568054	2025-07-10 10:21:31.568054
14	1	DEF	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.704255	2025-07-10 10:21:31.704255
15	1	GHI	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.840849	2025-07-10 10:21:31.840849
16	1	JKL	\N	\N	\N	\N	\N	Net 30	0.00	\N	2025-07-10 10:21:31.977752	2025-07-10 10:21:31.977752
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expense_categories (id, company_id, name, description, is_active, created_at, updated_at, main_account_type, detail_type) FROM stdin;
1	1	Business Expense		t	2025-07-10 08:20:37.859252	2025-07-10 08:20:37.859252	expenses	Utilities
2	1	Bank Charges	Bank service fees and charges	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Bank Charges
3	1	Accounts Payable (A/P)	Payable tracking and management	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Current Liabilities	Accounts Payable
4	1	Network and Server	IT infrastructure and hosting costs	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Computer and Internet Expenses
5	1	Office Supplies	General office supplies and materials	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Office Supplies
6	1	Travel and Meals	Business travel and meal expenses	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Travel and Meals
7	1	Marketing and Advertising	Marketing campaigns and advertising costs	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Advertising and Marketing
8	1	Professional Services	Legal, consulting, and professional fees	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Professional Services
9	1	Insurance	Business insurance premiums	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Insurance
10	1	Utilities	Electric, gas, water, and other utilities	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Utilities
11	1	Rent and Lease	Office rent and equipment lease payments	t	2025-07-10 08:31:03.586279	2025-07-10 08:31:03.586279	Expense	Rent and Lease
12	1	Business Expense		t	2025-07-10 09:01:21.687278	2025-07-10 09:01:21.687278	expenses	Salaries & Wages
13	1	Business Expense		t	2025-07-16 12:21:58.738764	2025-07-16 12:21:58.738764	cash_and_cash_equivalents	Cash on hand
\.


--
-- Data for Name: expense_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expense_transactions (id, company_id, expense_category_id, transaction_date, payee, transaction_type, description, amount_before_tax, sales_tax, total_amount, vendor_id, bill_id, notes, created_at, updated_at) FROM stdin;
1	1	1	2025-07-06	Global Enterprises	EXPENSE	Global Enterprises - Internet Bill	307.00	0.00	307.00	\N	\N	Auto-created from bank transaction ID 2	2025-07-10 08:37:17.439866	2025-07-10 08:37:17.439866
2	1	1	2025-07-10	Emily Davis	EXPENSE	Emily Davis - Refund	998.00	0.00	998.00	\N	\N	Auto-created from bank transaction ID 1	2025-07-10 09:32:24.379067	2025-07-10 09:32:24.379067
3	1	1	2025-07-10	MCM	EXPENSE	MCM - Refund	998.00	0.00	998.00	\N	\N	test	2025-07-10 10:37:10.352383	2025-07-10 10:37:10.352383
4	1	1	2025-04-03	Tech Solutions	EXPENSE	Tech Solutions - Internet Bill	194.00	0.00	194.00	\N	\N	Auto-created from bank transaction ID 33	2025-07-16 12:33:45.030635	2025-07-16 12:33:45.030635
6	1	1	2025-07-16	ABC	EXPENSE		122.00	0.00	122.00	\N	\N		2025-07-16 12:50:58.358068	2025-07-16 12:50:58.358068
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, company_id, customer_id, invoice_number, invoice_date, due_date, amount, paid_amount, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.journal_entries (id, company_id, transaction_id, account_id, description, debit_amount, credit_amount, entry_date, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.permissions (id, name, resource, action, description, created_at) FROM stdin;
1	company.read	company	read	View company information	2025-07-10 07:40:27.749232
2	company.write	company	write	Edit company information	2025-07-10 07:40:27.843626
3	company.delete	company	delete	Delete company	2025-07-10 07:40:27.927556
4	company.manage	company	manage	Full company management	2025-07-10 07:40:28.011404
5	customers.read	customers	read	View customers	2025-07-10 07:40:28.095386
6	customers.write	customers	write	Edit customers	2025-07-10 07:40:28.178829
7	customers.delete	customers	delete	Delete customers	2025-07-10 07:40:28.261863
8	customers.manage	customers	manage	Full customer management	2025-07-10 07:40:28.34435
9	vendors.read	vendors	read	View vendors	2025-07-10 07:40:28.426975
10	vendors.write	vendors	write	Edit vendors	2025-07-10 07:40:28.510156
11	vendors.delete	vendors	delete	Delete vendors	2025-07-10 07:40:28.593649
12	vendors.manage	vendors	manage	Full vendor management	2025-07-10 07:40:28.676813
13	transactions.read	transactions	read	View transactions	2025-07-10 07:40:28.760151
14	transactions.write	transactions	write	Edit transactions	2025-07-10 07:40:28.843277
15	transactions.delete	transactions	delete	Delete transactions	2025-07-10 07:40:28.927271
16	transactions.manage	transactions	manage	Full transaction management	2025-07-10 07:40:29.01242
17	bank_statements.read	bank_statements	read	View bank statements	2025-07-10 07:40:29.094605
18	bank_statements.write	bank_statements	write	Upload and categorize bank statements	2025-07-10 07:40:29.17782
19	bank_statements.delete	bank_statements	delete	Delete bank statements	2025-07-10 07:40:29.261192
20	bank_statements.manage	bank_statements	manage	Full bank statement management	2025-07-10 07:40:29.344579
21	reports.read	reports	read	View reports	2025-07-10 07:40:29.427574
22	reports.generate	reports	generate	Generate reports	2025-07-10 07:40:29.510807
23	reports.export	reports	export	Export reports	2025-07-10 07:40:29.594087
24	users.read	users	read	View users	2025-07-10 07:40:29.676122
25	users.write	users	write	Edit users	2025-07-10 07:40:29.759437
26	users.delete	users	delete	Delete users	2025-07-10 07:40:29.844972
27	users.manage	users	manage	Full user management	2025-07-10 07:40:29.92817
28	roles.read	roles	read	View roles	2025-07-10 07:40:30.011404
29	roles.write	roles	write	Edit roles	2025-07-10 07:40:30.094536
30	roles.delete	roles	delete	Delete roles	2025-07-10 07:40:30.17785
31	roles.manage	roles	manage	Full role management	2025-07-10 07:40:30.261182
\.


--
-- Data for Name: revenue_uploads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.revenue_uploads (id, company_id, file_name, upload_date, processed_date, status, total_rows, processed_rows, error_message, created_at) FROM stdin;
1	1	Revenue Test.csv	2025-07-09 10:34:25.01981	\N	UPLOADED	2	0	\N	2025-07-09 10:34:25.01981
2	1	Revenue Test.csv	2025-07-09 10:36:36.862612	2025-07-09 10:36:37.505	PROCESSED	2	2	\N	2025-07-09 10:36:36.862612
3	1	Revenue Test.csv	2025-07-09 10:48:29.848395	2025-07-09 10:48:30.375	PROCESSED	2	2	\N	2025-07-09 10:48:29.848395
4	1	Revenue Test.csv	2025-07-10 10:21:30.3656	2025-07-10 10:21:32.054	PROCESSED	8	8	\N	2025-07-10 10:21:30.3656
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
1	1	1	2025-07-10 07:40:30.442713
2	1	2	2025-07-10 07:40:30.530215
3	1	3	2025-07-10 07:40:30.613708
4	1	4	2025-07-10 07:40:30.696218
5	1	5	2025-07-10 07:40:30.780094
6	1	6	2025-07-10 07:40:30.864783
7	1	7	2025-07-10 07:40:30.947177
8	1	8	2025-07-10 07:40:31.030244
9	1	9	2025-07-10 07:40:31.113666
10	1	10	2025-07-10 07:40:31.196776
11	1	11	2025-07-10 07:40:31.280145
12	1	12	2025-07-10 07:40:31.363388
13	1	13	2025-07-10 07:40:31.447078
14	1	14	2025-07-10 07:40:31.529168
15	1	15	2025-07-10 07:40:31.612694
16	1	16	2025-07-10 07:40:31.696399
17	1	17	2025-07-10 07:40:31.779554
18	1	18	2025-07-10 07:40:31.863335
19	1	19	2025-07-10 07:40:31.947537
20	1	20	2025-07-10 07:40:32.031177
21	1	21	2025-07-10 07:40:32.116017
22	1	22	2025-07-10 07:40:32.1995
23	1	23	2025-07-10 07:40:32.282576
24	1	24	2025-07-10 07:40:32.365892
25	1	25	2025-07-10 07:40:32.450018
26	1	26	2025-07-10 07:40:32.542157
27	1	27	2025-07-10 07:40:32.625143
28	1	28	2025-07-10 07:40:32.708165
29	1	29	2025-07-10 07:40:32.791431
30	1	30	2025-07-10 07:40:32.874969
31	1	31	2025-07-10 07:40:32.957166
32	2	1	2025-07-10 07:40:33.12296
33	2	2	2025-07-10 07:40:33.205773
34	2	4	2025-07-10 07:40:33.288891
35	2	5	2025-07-10 07:40:33.373232
36	3	1	2025-07-10 07:40:38.746784
37	3	5	2025-07-10 07:40:38.830259
38	3	6	2025-07-10 07:40:38.912786
39	3	8	2025-07-10 07:40:38.994974
40	3	9	2025-07-10 07:40:39.077461
41	3	10	2025-07-10 07:40:39.15996
42	3	12	2025-07-10 07:40:39.242324
43	3	13	2025-07-10 07:40:39.324415
44	3	14	2025-07-10 07:40:39.406894
45	3	16	2025-07-10 07:40:39.489837
46	3	17	2025-07-10 07:40:39.571859
47	3	18	2025-07-10 07:40:39.654807
48	3	20	2025-07-10 07:40:39.737408
49	3	21	2025-07-10 07:40:39.820189
50	3	22	2025-07-10 07:40:39.902483
51	3	23	2025-07-10 07:40:39.984826
52	4	1	2025-07-10 07:40:40.149533
53	4	5	2025-07-10 07:40:40.232135
54	4	6	2025-07-10 07:40:40.314427
55	4	9	2025-07-10 07:40:40.396228
56	4	10	2025-07-10 07:40:40.476834
57	4	13	2025-07-10 07:40:40.559053
58	4	14	2025-07-10 07:40:40.668482
59	4	17	2025-07-10 07:40:40.793542
60	4	18	2025-07-10 07:40:40.877048
61	4	21	2025-07-10 07:40:40.98144
62	5	1	2025-07-10 07:40:41.163759
63	5	5	2025-07-10 07:40:41.245788
64	5	9	2025-07-10 07:40:41.328226
65	5	13	2025-07-10 07:40:41.410476
66	5	17	2025-07-10 07:40:41.492546
67	5	21	2025-07-10 07:40:41.574733
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, company_id, transaction_number, transaction_date, transaction_type, description, amount, customer_id, vendor_id, bank_account_id, category_id, is_reconciled, reconciled_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_role_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_role_assignments (id, user_id, role_id, company_id, assigned_by, assigned_at, expires_at, is_active) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_roles (id, name, description, is_system_role, created_at, updated_at) FROM stdin;
1	Super Admin	Full system access with all permissions	t	2025-07-10 07:40:30.356295	2025-07-10 07:40:30.356295
2	Company Admin	Full access to company data and user management	f	2025-07-10 07:40:33.040059	2025-07-10 07:40:33.040059
3	Accountant	Full access to financial data and transactions	f	2025-07-10 07:40:38.660669	2025-07-10 07:40:38.660669
4	Bookkeeper	Data entry and basic transaction management	f	2025-07-10 07:40:40.06737	2025-07-10 07:40:40.06737
5	Viewer	Read-only access to financial data	f	2025-07-10 07:40:41.079627	2025-07-10 07:40:41.079627
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (id, user_id, session_token, expires_at, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, password, is_active, last_login_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, company_id, name, contact_person, email, phone, billing_address, default_payment_method, opening_balance, opening_balance_date, created_at, updated_at) FROM stdin;
\.


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 4, true);


--
-- Name: bank_statement_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bank_statement_transactions_id_seq', 48, true);


--
-- Name: bank_statement_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bank_statement_uploads_id_seq', 3, true);


--
-- Name: bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bills_id_seq', 1, false);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.chart_of_accounts_id_seq', 60, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 4, true);


--
-- Name: customer_statement_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_statement_lines_id_seq', 20, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 17, true);


--
-- Name: expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expense_categories_id_seq', 13, true);


--
-- Name: expense_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expense_transactions_id_seq', 6, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.journal_entries_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.permissions_id_seq', 31, true);


--
-- Name: revenue_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.revenue_uploads_id_seq', 4, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 67, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_role_assignments_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 5, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 1, false);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, false);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_statement_transactions bank_statement_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_pkey PRIMARY KEY (id);


--
-- Name: bank_statement_uploads bank_statement_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_uploads
    ADD CONSTRAINT bank_statement_uploads_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: customer_statement_lines customer_statement_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expense_transactions expense_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions
    ADD CONSTRAINT expense_transactions_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: revenue_uploads revenue_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.revenue_uploads
    ADD CONSTRAINT revenue_uploads_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_unique UNIQUE (role_id, permission_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_role_assignments user_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: user_role_assignments user_role_assignments_user_id_role_id_company_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_user_id_role_id_company_id_unique UNIQUE (user_id, role_id, company_id);


--
-- Name: user_roles user_roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_name_unique UNIQUE (name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_session_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_token_unique UNIQUE (session_token);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: bank_accounts bank_accounts_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_bank_account_id_bank_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_bank_account_id_bank_accounts_id_fk FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_bank_statement_upload_id_bank_state; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_bank_statement_upload_id_bank_state FOREIGN KEY (bank_statement_upload_id) REFERENCES public.bank_statement_uploads(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_category_id_expense_categories_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_category_id_expense_categories_id_f FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_suggested_category_id_expense_categ; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_suggested_category_id_expense_categ FOREIGN KEY (suggested_category_id) REFERENCES public.expense_categories(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_suggested_customer_id_customers_id_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_suggested_customer_id_customers_id_ FOREIGN KEY (suggested_customer_id) REFERENCES public.customers(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_suggested_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_suggested_vendor_id_vendors_id_fk FOREIGN KEY (suggested_vendor_id) REFERENCES public.vendors(id);


--
-- Name: bank_statement_transactions bank_statement_transactions_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_transactions
    ADD CONSTRAINT bank_statement_transactions_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: bank_statement_uploads bank_statement_uploads_bank_account_id_bank_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_uploads
    ADD CONSTRAINT bank_statement_uploads_bank_account_id_bank_accounts_id_fk FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: bank_statement_uploads bank_statement_uploads_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_statement_uploads
    ADD CONSTRAINT bank_statement_uploads_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: bills bills_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: bills bills_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: chart_of_accounts chart_of_accounts_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: chart_of_accounts chart_of_accounts_parent_account_id_chart_of_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_parent_account_id_chart_of_accounts_id_fk FOREIGN KEY (parent_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: customer_statement_lines customer_statement_lines_bank_statement_transaction_id_bank_sta; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_bank_statement_transaction_id_bank_sta FOREIGN KEY (bank_statement_transaction_id) REFERENCES public.bank_statement_transactions(id);


--
-- Name: customer_statement_lines customer_statement_lines_bank_statement_upload_id_bank_statemen; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_bank_statement_upload_id_bank_statemen FOREIGN KEY (bank_statement_upload_id) REFERENCES public.bank_statement_uploads(id);


--
-- Name: customer_statement_lines customer_statement_lines_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: customer_statement_lines customer_statement_lines_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_statement_lines customer_statement_lines_revenue_upload_id_revenue_uploads_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_statement_lines
    ADD CONSTRAINT customer_statement_lines_revenue_upload_id_revenue_uploads_id_f FOREIGN KEY (revenue_upload_id) REFERENCES public.revenue_uploads(id);


--
-- Name: customers customers_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: expense_categories expense_categories_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: expense_transactions expense_transactions_bill_id_bills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions
    ADD CONSTRAINT expense_transactions_bill_id_bills_id_fk FOREIGN KEY (bill_id) REFERENCES public.bills(id);


--
-- Name: expense_transactions expense_transactions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions
    ADD CONSTRAINT expense_transactions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: expense_transactions expense_transactions_expense_category_id_expense_categories_id_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions
    ADD CONSTRAINT expense_transactions_expense_category_id_expense_categories_id_ FOREIGN KEY (expense_category_id) REFERENCES public.expense_categories(id);


--
-- Name: expense_transactions expense_transactions_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_transactions
    ADD CONSTRAINT expense_transactions_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: invoices invoices_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: journal_entries journal_entries_account_id_chart_of_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_account_id_chart_of_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: journal_entries journal_entries_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: journal_entries journal_entries_transaction_id_transactions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_transaction_id_transactions_id_fk FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: revenue_uploads revenue_uploads_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.revenue_uploads
    ADD CONSTRAINT revenue_uploads_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permissions role_permissions_role_id_user_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_user_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- Name: transactions transactions_bank_account_id_bank_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_bank_account_id_bank_accounts_id_fk FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: transactions transactions_category_id_expense_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_expense_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: transactions transactions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: transactions transactions_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: transactions transactions_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: user_role_assignments user_role_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: user_role_assignments user_role_assignments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: user_role_assignments user_role_assignments_role_id_user_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_role_id_user_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- Name: user_role_assignments user_role_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_sessions user_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vendors vendors_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--


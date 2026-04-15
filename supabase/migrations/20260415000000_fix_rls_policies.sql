-- Fix product_types RLS
DROP POLICY IF EXISTS "authenticated_all_product_types" ON public.product_types;
DROP POLICY IF EXISTS "authenticated_select_product_types" ON public.product_types;
DROP POLICY IF EXISTS "authenticated_insert_product_types" ON public.product_types;
DROP POLICY IF EXISTS "authenticated_update_product_types" ON public.product_types;
DROP POLICY IF EXISTS "authenticated_delete_product_types" ON public.product_types;

CREATE POLICY "authenticated_select_product_types" ON public.product_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_product_types" ON public.product_types
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_product_types" ON public.product_types
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_product_types" ON public.product_types
  FOR DELETE TO authenticated USING (true);

-- Fix products RLS
DROP POLICY IF EXISTS "authenticated_all_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_select_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_insert_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_update_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_delete_products" ON public.products;

CREATE POLICY "authenticated_select_products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_products" ON public.products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_products" ON public.products
  FOR DELETE TO authenticated USING (true);

-- Fix clients RLS
DROP POLICY IF EXISTS "authenticated_all_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_select_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_insert_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_update_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_delete_clients" ON public.clients;

CREATE POLICY "authenticated_select_clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_clients" ON public.clients
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_clients" ON public.clients
  FOR DELETE TO authenticated USING (true);

-- Fix product_documents RLS
DROP POLICY IF EXISTS "authenticated_all_documents" ON public.product_documents;
DROP POLICY IF EXISTS "authenticated_select_documents" ON public.product_documents;
DROP POLICY IF EXISTS "authenticated_insert_documents" ON public.product_documents;
DROP POLICY IF EXISTS "authenticated_update_documents" ON public.product_documents;
DROP POLICY IF EXISTS "authenticated_delete_documents" ON public.product_documents;

CREATE POLICY "authenticated_select_documents" ON public.product_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_documents" ON public.product_documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_documents" ON public.product_documents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_documents" ON public.product_documents
  FOR DELETE TO authenticated USING (true);

-- Fix campaigns RLS
DROP POLICY IF EXISTS "authenticated_all_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "authenticated_select_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "authenticated_insert_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "authenticated_update_campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "authenticated_delete_campaigns" ON public.campaigns;

CREATE POLICY "authenticated_select_campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_campaigns" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_campaigns" ON public.campaigns
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_campaigns" ON public.campaigns
  FOR DELETE TO authenticated USING (true);

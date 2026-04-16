-- Fix RLS for clients table
DROP POLICY IF EXISTS "authenticated_all_clients" ON public.clients;
DROP POLICY IF EXISTS "users_insert_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_select_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_update_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_delete_own_clients" ON public.clients;

CREATE POLICY "users_insert_own_clients" ON public.clients
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_clients" ON public.clients
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_clients" ON public.clients
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_clients" ON public.clients
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix RLS for products table
DROP POLICY IF EXISTS "authenticated_all_products" ON public.products;
DROP POLICY IF EXISTS "users_insert_own_products" ON public.products;
DROP POLICY IF EXISTS "users_select_own_products" ON public.products;
DROP POLICY IF EXISTS "users_update_own_products" ON public.products;
DROP POLICY IF EXISTS "users_delete_own_products" ON public.products;

CREATE POLICY "users_insert_own_products" ON public.products
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_products" ON public.products
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_products" ON public.products
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_products" ON public.products
FOR DELETE TO authenticated USING (auth.uid() = user_id);

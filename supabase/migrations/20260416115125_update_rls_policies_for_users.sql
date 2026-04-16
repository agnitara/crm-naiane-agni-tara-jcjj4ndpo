-- Habilitar RLS na tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Fix clients RLS to only allow users to manage their own clients
DROP POLICY IF EXISTS "authenticated_select_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_insert_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_update_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_delete_clients" ON public.clients;
DROP POLICY IF EXISTS "users_insert_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_select_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_update_own_clients" ON public.clients;
DROP POLICY IF EXISTS "users_delete_own_clients" ON public.clients;

-- Política: Usuário pode INSERIR apenas com seu próprio user_id
CREATE POLICY "users_insert_own_clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode VER apenas seus próprios clientes
CREATE POLICY "users_select_own_clients" ON public.clients
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Política: Usuário pode ATUALIZAR apenas seus próprios clientes
CREATE POLICY "users_update_own_clients" ON public.clients
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Política: Usuário pode DELETAR apenas seus próprios clientes
CREATE POLICY "users_delete_own_clients" ON public.clients
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Habilitar RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Fix products RLS to only allow users to manage their own products
DROP POLICY IF EXISTS "authenticated_select_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_insert_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_update_products" ON public.products;
DROP POLICY IF EXISTS "authenticated_delete_products" ON public.products;
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

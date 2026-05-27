CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    delivery_address,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(new.raw_user_meta_data ->> 'delivery_address', NULL),
    COALESCE(new.raw_user_meta_data ->> 'role', 'customer') -- 🌟 Falls back to 'customer' string
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public; -- 🌟 Keeps the search path safe

-- 3. Attach the trigger hook to auth.users
CREATE or replace TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
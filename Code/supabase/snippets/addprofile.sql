create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    delivery_address
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name',''),
    coalesce(new.raw_user_meta_data ->> 'last_name',''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'delivery_address'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach the trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- 12 недель · удаление аккаунта самим пользователем (требование App Store / GDPR)
create or replace function public.tw_delete_me()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  delete from public.tw_group_member where user_id = auth.uid();
  delete from public.tw_state where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.tw_delete_me() from public, anon;
grant execute on function public.tw_delete_me() to authenticated;

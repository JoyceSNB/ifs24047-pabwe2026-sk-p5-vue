import { apiFetch } from '../../../helpers/apiHelper';
export const getUsers=(params={})=>apiFetch('/users',{query:params});
export const getUser=(id)=>apiFetch(`/users/${id}`);
export const updateUser=(id,body)=>apiFetch(`/users/${id}`,{method:'PUT',body});

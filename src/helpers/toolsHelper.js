import Swal from 'sweetalert2';
export const formatRupiah=(n)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
export const formatDate=(v)=>v?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)): '-';
export const toDateTimeLocal=(v)=>{if(!v)return '';const d=new Date(v);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
export const showSuccessDialog=(title='Berhasil',text='')=>Swal.fire({icon:'success',title,text});
export const showErrorDialog=(text='Terjadi kesalahan')=>Swal.fire({icon:'error',title:'Gagal',text});
export const showWarningDialog=(text)=>Swal.fire({icon:'warning',title:'Peringatan',text});
export const showConfirmDialog=async(text)=>{const r=await Swal.fire({icon:'question',title:'Konfirmasi',text,showCancelButton:true,confirmButtonText:'Ya',cancelButtonText:'Batal'});return r.isConfirmed};

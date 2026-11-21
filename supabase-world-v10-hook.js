/* Add this block inside the existing Supabase IIFE, immediately BEFORE:
   window.sfQueueSync=()=>{if(session&&client)sync();};
*/
 window.sfWorldCanReview=()=>!!isAdmin;
 window.sfWorldSubmitSource=async(payload)=>{
  if(!client||!session)throw new Error("Connecte-toi pour proposer une source.");
  if(!payload.source_name)throw new Error("Nom de source obligatoire.");
  if((payload.records||[]).length>1000)throw new Error("Maximum 1000 lignes CSV par import.");
  const row={submitted_by:session.user.id,source_name:payload.source_name,country:payload.country||null,
   source_url:payload.source_url||null,notes:payload.notes||null,records:payload.records||[]};
  const {data:created,error}=await client.from("world_import_queue").insert(row).select("*").single();
  if(error)throw error;return created;
 };
 window.sfWorldListQueue=async()=>{
  if(!client||!session)return [];
  const {data:rows,error}=await client.from("world_import_queue").select("*").order("created_at",{ascending:false}).limit(100);
  if(error)throw error;return rows||[];
 };
 window.sfWorldReviewQueue=async(id,status,count)=>{
  if(!client||!session||!isAdmin)throw new Error("Réservé à l'administrateur.");
  const {error}=await client.from("world_import_queue").update({status,imported_count:count||0,
   reviewed_at:new Date().toISOString(),reviewed_by:session.user.id}).eq("id",id);
  if(error)throw error;
 };

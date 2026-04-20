const { supabase } = require('../../supabase');

async function checkIsAdmin(userId) {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return false;
    return true;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

// Kept for backward compatibility to prevent crashes, but will return false.
// New code must use checkIsAdmin.
function isOwnerUser(userId) {
  return false;
}

module.exports = {
  checkIsAdmin,
  isOwnerUser,
};

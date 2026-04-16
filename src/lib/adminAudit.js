import { firebaseApi } from '@/api/firebaseClient';

export async function logAdminActivity({
  action,
  actorName = 'Admin',
  actorEmail = '',
  targetType,
  targetId,
  summary,
  metadata = {},
}) {
  try {
    await firebaseApi.entities.AuditLog.create({
      action,
      actor_name: actorName,
      actor_email: actorEmail,
      target_type: targetType,
      target_id: targetId,
      summary,
      metadata,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

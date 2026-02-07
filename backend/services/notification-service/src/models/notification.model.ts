import pool from '../config/database';

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'reply';
  title: string;
  message: string;
  actor_id: string; // Who performed the action
  entity_type?: 'blog' | 'comment';
  entity_id?: string;
  is_read: boolean;
  created_at: Date;
}

// Initialize notifications table
export const initDatabase = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      actor_id UUID NOT NULL,
      entity_type VARCHAR(50),
      entity_id UUID,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error: any) {
    if (error.code !== '42P07') { // Ignore "already exists" error
      throw error;
    }
  }
};

// Create a new notification
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  actorId: string,
  entityType?: string,
  entityId?: string
): Promise<Notification> => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, actor_id, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, type, title, message, actorId, entityType, entityId]
  );
  return result.rows[0];
};

// Get user notifications (paginated)
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

// Get unread notification count
export const getUnreadCount = async (userId: string): Promise<number> => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

// Mark notification as read
export const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );
};

// Mark all notifications as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
    [userId]
  );
};

// Delete a notification
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  await pool.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );
};

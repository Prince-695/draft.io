import { ObjectId } from 'mongodb';
import { getDB } from '../config/mongodb';

export interface Message {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id?: ObjectId;
  participants: string[]; // [userId1, userId2]
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class MessageModel {
  private collectionName = 'messages';
  private conversationsCollection = 'conversations';

  /**
   * Generate conversation ID from two user IDs (always sorted for consistency)
   */
  generateConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  /**
   * Send a new message
   */
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    const db = getDB();
    const conversationId = this.generateConversationId(senderId, receiverId);

    const message: Message = {
      conversationId,
      senderId,
      receiverId,
      content,
      isRead: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Message>(this.collectionName).insertOne(message);
    message._id = result.insertedId;

    // Update or create conversation
    await db.collection<Conversation>(this.conversationsCollection).updateOne(
      { participants: { $all: [senderId, receiverId] } },
      {
        $set: {
          lastMessage: content,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          participants: [senderId, receiverId],
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return message;
  }

  /**
   * Get message history between two users with pagination
   */
  async getMessages(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    const db = getDB();
    const conversationId = this.generateConversationId(userId1, userId2);
    const skip = (page - 1) * limit;

    const messages = await db
      .collection<Message>(this.collectionName)
      .find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db
      .collection<Message>(this.collectionName)
      .countDocuments({ conversationId, isDeleted: false });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      hasMore: skip + messages.length < total,
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: string, senderId: string): Promise<number> {
    const db = getDB();
    const conversationId = this.generateConversationId(userId, senderId);

    const result = await db.collection<Message>(this.collectionName).updateMany(
      {
        conversationId,
        receiverId: userId,
        senderId: senderId,
        isRead: false,
      },
      {
        $set: { isRead: true, updatedAt: new Date() },
      }
    );

    return result.modifiedCount;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const db = getDB();

    const result = await db.collection<Message>(this.collectionName).updateOne(
      {
        _id: new ObjectId(messageId),
        senderId: userId, // Only sender can delete their message
      },
      {
        $set: { isDeleted: true, updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Get user's conversation list
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    const db = getDB();

    const conversations = await db
      .collection<Conversation>(this.conversationsCollection)
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .toArray();

    return conversations;
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const db = getDB();

    const count = await db.collection<Message>(this.collectionName).countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    });

    return count;
  }

  /**
   * Get unread count by conversation
   */
  async getUnreadByConversation(userId: string, senderId: string): Promise<number> {
    const db = getDB();
    const conversationId = this.generateConversationId(userId, senderId);

    const count = await db.collection<Message>(this.collectionName).countDocuments({
      conversationId,
      receiverId: userId,
      senderId: senderId,
      isRead: false,
      isDeleted: false,
    });

    return count;
  }
}

export default new MessageModel();

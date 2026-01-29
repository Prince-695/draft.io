import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as likeModel from '../models/like.model';
import * as commentModel from '../models/comment.model';
import * as bookmarkModel from '../models/bookmark.model';

// Like endpoints
export const likeBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.user_id;
    
    const like = await likeModel.likeBlog(userId, blogId);
    
    res.json({
      success: true,
      message: 'Blog liked successfully',
      data: { like }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to like blog' });
  }
};

export const unlikeBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.user_id;
    
    await likeModel.unlikeBlog(userId, blogId);
    
    res.json({
      success: true,
      message: 'Blog unliked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to unlike blog' });
  }
};

// Comment endpoints
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.user_id;
    
    const comment = await commentModel.createComment(blogId, userId, content, parentId);
    
    res.json({
      success: true,
      message: 'Comment created successfully',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
};

export const getBlogComments = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const comments = await commentModel.getBlogComments(blogId, limit, offset);
    
    res.json({
      success: true,
      data: { comments, pagination: { limit, offset } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get comments' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.user_id;
    
    const comment = await commentModel.updateComment(commentId, userId, content);
    
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.user_id;
    
    const deleted = await commentModel.deleteComment(commentId, userId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
};

// Bookmark endpoints
export const bookmarkBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.user_id;
    
    const bookmark = await bookmarkModel.bookmarkBlog(userId, blogId);
    
    res.json({
      success: true,
      message: 'Blog bookmarked successfully',
      data: { bookmark }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to bookmark blog' });
  }
};

export const unbookmarkBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.user_id;
    
    await bookmarkModel.unbookmarkBlog(userId, blogId);
    
    res.json({
      success: true,
      message: 'Blog unbookmarked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to unbookmark blog' });
  }
};

export const getUserBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.user_id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const bookmarks = await bookmarkModel.getUserBookmarks(userId, limit, offset);
    
    res.json({
      success: true,
      data: { bookmarks, pagination: { limit, offset } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get bookmarks' });
  }
};

// Share endpoint
export const trackShare = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { platform } = req.body;
    const userId = req.user?.user_id || null;
    
    await bookmarkModel.trackShare(blogId, userId, platform);
    
    res.json({
      success: true,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to track share' });
  }
};

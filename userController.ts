import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { dbService } from '../services/storage.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// GET /api/users
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isMongo = getIsMongoConnected();
    let usersList = [];

    if (isMongo) {
      const dbUsers = await User.find().select('-password');
      usersList = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      }));
    } else {
      const localUsers = await dbService.getUsers();
      usersList = localUsers.map(({ password, ...u }) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      }));
    }

    res.status(200).json({ success: true, count: usersList.length, users: usersList });
  } catch (error: any) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
}

// GET /api/users/:id
export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const isMongo = getIsMongoConnected();
    let userDetails = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid User Object ID format' });
        return;
      }
      const userDoc = await User.findById(id).select('-password');
      if (userDoc) {
        userDetails = {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          avatar: userDoc.avatar,
        };
      }
    } else {
      const localUser = await dbService.getUserById(id);
      if (localUser) {
        userDetails = {
          id: localUser._id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          avatar: localUser.avatar,
        };
      }
    }

    if (!userDetails) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user: userDetails });
  } catch (error: any) {
    console.error('getUserById error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving user data' });
  }
}

// PUT /api/users/profile
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { name, email, password, avatar } = req.body;
  const userId = req.user.id;

  try {
    const isMongo = getIsMongoConnected();
    let updatedUserResult = null;

    if (isMongo) {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Check if email is already taken by another user
      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          res.status(400).json({ success: false, message: 'Email already taken' });
          return;
        }
        user.email = email;
      }

      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      if (password) user.password = password; // Trigger pre-save hashing

      await user.save();
      updatedUserResult = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };
    } else {
      const localUser = await dbService.getUserById(userId);
      if (!localUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (email && email.toLowerCase() !== localUser.email.toLowerCase()) {
        const emailExists = await dbService.getUserByEmail(email);
        if (emailExists) {
          res.status(400).json({ success: false, message: 'Email already taken' });
          return;
        }
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (avatar !== undefined) updates.avatar = avatar;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
      }

      const updated = await dbService.updateUser(userId, updates);
      if (updated) {
        updatedUserResult = {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          avatar: updated.avatar,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserResult,
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
}

// PUT /api/users/:id (Admin only)
export async function updateUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'member'].includes(role)) {
    res.status(400).json({ success: false, message: 'Please provide a valid clearance level' });
    return;
  }

  try {
    const isMongo = getIsMongoConnected();
    let updatedUserResult = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid User Object ID format' });
        return;
      }
      const userDoc = await User.findById(id);
      if (!userDoc) {
        res.status(444).json({ success: false, message: 'User profile not found' });
        return;
      }
      
      userDoc.role = role;
      await userDoc.save();

      updatedUserResult = {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        avatar: userDoc.avatar,
      };
    } else {
      const localUser = await dbService.getUserById(id);
      if (!localUser) {
        res.status(444).json({ success: false, message: 'User profile not found' });
        return;
      }

      const updated = await dbService.updateUser(id, { role });
      if (updated) {
        updatedUserResult = {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          avatar: updated.avatar,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUserResult,
    });
  } catch (error: any) {
    console.error('updateUserById error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
}


import { handleGenerateToken } from '../authentication/auth';
import { Request, Response } from 'express';
import { prisma } from '../connection';
import { avatars } from '../const';
import bcrypt from 'bcryptjs';

const handleCreateNewTask = async (req: Request, res: Response) => {
  try {
    const {
      taskId,
      ticketId,
      priority,
      title,
      type,
      status,
      description,
      assignToId,
      reportedById,
    } = req.body;
    if (!taskId || !ticketId || !title || !type || !reportedById) {
      res.status(404).json({ message: 'Task required information missing!' });
      return;
    }

    // add the task in the db..
    await prisma.task.create({
      data: {
        taskId: taskId,
        ticketId: ticketId,
        reportedById: reportedById,
        allowedMembers: assignToId ? [assignToId] : [],
        priority: Number(priority),
        title,
        type,
        status,
        description,
        assignToId,
      },
    });

    res.status(201).json({ message: 'task created !!' });
    return;
  } catch (error: any) {
    res.status(505).json({ message: `Internal Error ${error.message}` });
    return;
  }
};

const handleUpdateTicket = async (req: Request, res: Response) => {
  try {
    const { taskId, updates } = req.body;

    if (!taskId || !updates) {
      return;
    }

    const updatedRecord = await prisma.task.update({
      where: { taskId: taskId },
      data: updates,
    });

    if (!updatedRecord) {
      res.status(404).json({ message: 'failed to update the ticket !!' });
      return;
    }

    res.status(200).json({ message: 'updated !!' });
    return;
  } catch (error: any) {
    res.status(505).json({ message: `Internal Error ${error.message}` });
    return;
  }
};

const handleFetchAllTask = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.task.findMany({
      include: {
        assignedUser: {
          select: {
            id: true,
            avatar: true,
            username: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            avatar: true,
            username: true,
          },
        },
      },
    });
    res.status(200).json({ tickets: tickets });
    return;
  } catch (error: any) {
    res.status(505).json({ message: `Internal Error ${error.message}` });
    return;
  }
};

const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Email and password are required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const token = handleGenerateToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      login: {
        ok: true,
        token,
        user: {
          id: user.id,
          fullName: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
    return;
  }
};

const handleRegister = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        message: 'Missing info !!',
      });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const index = Math.floor(Math.random() * avatars.length);

    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        avatar: avatars[index],
        role: role || 'USER',
        password: hashPassword,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Failed to create user !!' });
      return;
    }

    res.status(200).json({ message: 'User created !!' });
    return;
  } catch (error: any) {
    res.status(505).json({ message: `Internal server error ${error.message}` });
  }
};

const handleFetchAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    });

    res.status(200).json({ users: users });
    return;
  } catch (error: any) {
    res.status(505).json({ message: `Internal server ${error.message}` });
    return;
  }
};

export {
  handleFetchAllUsers,
  handleCreateNewTask,
  handleFetchAllTask,
  handleUpdateTicket,
  handleRegister,
  handleLogin,
};

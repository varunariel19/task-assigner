import { Request, Response } from "express"
import { prisma } from "../connection";


export const handleAddComment = async (req: Request, res: Response) => {
    try {
        const { id, taskId, comment, commentedBy } = req.body.comment;

        if (!taskId || !comment) {
            return res.status(400).json({
                success: false,
                message: "taskId and comment are required",
            });
        }

        if (typeof comment !== "string" || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
            });
        }

        const ticketExists = await prisma.task.findUnique({
            where: { taskId: taskId },
            select: { taskId: true },
        });

        if (!ticketExists) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        const newComment = await prisma.comment.create({
            data: {
                id: id,
                ticketId: taskId,
                userId: commentedBy,
                content: comment.trim(),
            }
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: newComment,
        });

    } catch (error) {
        console.error("Add Comment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const handleEditComment = async (req: Request, res: Response) => {
    try {
        const { editedComment, commentId } = req.body;

        if (!editedComment || !commentId) {
            res.status(404).json({ message: "comment info missing ! failed to update !!" });
            return;
        }
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { edited: true, content: editedComment }
        });

        return res.status(202).json({ message: "comment updated !!" });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const handleFetchAllComments = async (req: Request, res: Response) => {
    try {
        const taskId = req.params['taskId'] as string;

        if (!taskId || typeof taskId !== 'string') {
            res.status(404).json({ message: "task Id missing !!" });
            return;
        }
        const comments = await prisma.comment.findMany({
            where: {
                ticketId: taskId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        avatar: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(202).json({ comments });

    } catch (error) {
        return res.status(505).json({ message: "Internal server error !!" });
    }
}


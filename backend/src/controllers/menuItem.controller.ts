// src/controllers/menuItem.controller.ts
import { Request, Response } from 'express';
import { MenuItem } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { MenuItemCreateBody } from '../routes/menuItem/menuItem.types';

export async function createMenuItem(req: Request, res: Response) {
  const { name, description, price, visible, available, tags }: MenuItemCreateBody = req.body;

  try {
    const newMenuItem: MenuItem = await prisma.menuItem.create({
      data: { name, description, price, visible, available, tags },
    });
    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
}

export async function updateMenuItem(req: Request, res: Response) {
  const menuItemId = req.params.id;
  const { name, description, price, visible, available, tags }: MenuItemCreateBody = req.body;

  try {
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { name, description, price, visible, available, tags },
    });
    res.status(200).json({ message: 'Updated correctly the menuItem', updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
}

export async function updateMenuItemVisibility(req: Request, res: Response) {
  const menuItemId = req.params.id;
  const { visible, available }: { visible?: boolean; available?: boolean } = req.body;

  try {
    const updateData: any = {};
    if (visible !== undefined) updateData.visible = visible;
    if (available !== undefined) updateData.available = available;

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateData,
    });
    res.status(200).json({ message: 'Updated correctly the menuItem', updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
}

export async function deleteMenuItem(req: Request, res: Response) {
  const menuItemId = req.params.id;

  try {
    const deletedMenuItem = await prisma.menuItem.delete({
      where: { id: menuItemId },
    });
    res.status(200).json({ message: 'Deleted correctly the menuItem', deletedMenuItem });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
}

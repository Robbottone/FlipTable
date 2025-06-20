// src/controllers/menuItem.controller.ts
import { Request, Response } from "express";
import { MenuItem } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { MenuItemCreateBody } from "../routes/menuItem/menuItem.types";

const menuItemController = {

  //se voglio visualizzare tutti gli item dei menu.
  getMenuItem: async (req: Request, res: Response) => {
    try {
      const menuItem: MenuItem | null = await prisma.menuItem.findUnique({
        where: { id: req.params.id }
      });

      if (!menuItem) {
        res.status(404).json({ error: "Menu item not found" }); 
        return;
      }

      res.status(200).json(menuItem);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  },

  createMenuItem: async (req: Request, res: Response) => {
    const {
      name,
      description,
      price,
      visible,
      available,
      tags,
    }: MenuItemCreateBody = req.body;

    try {
      const newMenuItem: MenuItem = await prisma.menuItem.create({
        data: { name, description, price, visible, available, tags },
      });
      res.status(201).json(newMenuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Failed to create menu item" });
    }
  },

  updateMenuItem: async (req: Request, res: Response) => {
    const menuItemId = req.params.id;
    const {
      name,
      description,
      price,
      visible,
      available,
      tags,
    }: MenuItemCreateBody = req.body;

    try {
      const updatedMenuItem = await prisma.menuItem.update({
        where: { id: menuItemId },
        data: { name, description, price, visible, available, tags },
      });
      res
        .status(200)
        .json({ message: "Updated correctly the menuItem", updatedMenuItem });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  },

  updateMenuItemVisibility: async (req: Request, res: Response) => {
    const menuItemId = req.params.id;
    const { visible, available }: { visible?: boolean; available?: boolean } =
      req.body;

    try {
      const updateData: any = {};
      if (visible !== undefined) updateData.visible = visible;
      if (available !== undefined) updateData.available = available;

      const updatedMenuItem = await prisma.menuItem.update({
        where: { id: menuItemId },
        data: updateData,
      });
      res
        .status(200)
        .json({ message: "Updated correctly the menuItem", updatedMenuItem });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  },

  deleteMenuItem: async (req: Request, res: Response) => {
    const menuItemId = req.params.id;

    try {
      const deletedMenuItem = await prisma.menuItem.delete({
        where: { id: menuItemId },
      });
      res
        .status(200)
        .json({ message: "Deleted correctly the menuItem", deletedMenuItem });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  },
}

export default menuItemController;

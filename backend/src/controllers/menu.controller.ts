// src/controllers/menuController.ts
import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { TenantRequest } from "../types/typedRequest";
import { MenuResponse } from "../routes/menu/menu.types";

const menuController = {
  
  getMenu: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;

    const foundMenu = await prisma.menu.findFirst({
      where: {
        tenantId: tenantReq.tenant.id,
      },
      include: {
        menuItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!foundMenu) {
      res.status(404).json({ error: "Menu not found for this tenant" });
      return;
    }

    const menuResponse: MenuResponse = {
      id: foundMenu.id,
      name: foundMenu.name,
      items: foundMenu.menuItems.map((item) => ({
        id: item.menuItemId,
        name: item.menuItem.name,
        description: item.menuItem.description,
        price: item.menuItem.price,
        visible: item.menuItem.visible,
        available: item.menuItem.available,
        tags: item.menuItem.tags,
      })),
    };

    res.json({ menuResponse });
  },

  getMenuById: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;
    const menuId = req.params.id;

    const foundMenu = await prisma.menu.findFirst({
      where: {
        tenantId: tenantReq.tenant.id,
        id: menuId,
      },
      include: {
        menuItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!foundMenu) {
      res
        .status(404)
        .json({ error: "Menu not found for this tenant and menuId" });
      return;
    }

    const menuResponse: MenuResponse = {
      id: foundMenu.id,
      name: foundMenu.name,
      items: foundMenu.menuItems.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        description: item.menuItem.description,
        price: item.menuItem.price,
        tags: item.menuItem.tags,
        visible: item.menuItem.visible,
        available: item.menuItem.available,
      })),
    };

    res.json({ menuResponse });
  },

  createMenu: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;
  
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({ error: "Invalid or missing menu name" });
      return;
    }

    const existingMenu = await prisma.menu.findFirst({
      where: {
        tenantId: tenantReq.tenant.id,
        name: name.trim(),
      },
    });

    if (existingMenu) {
      res.status(409).json({ error: "Menu with this name already exists" });
      return;
    }

    const newMenu = await prisma.menu.create({
      data: {
        name: name.trim(),
        tenantId: tenantReq.tenant.id,
        isActive: false,
      },
    });

    res.status(201).json({ message: "Menu created successfully", menuId: newMenu.id });
  },

  deleteMenu: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;
    const { menuIds }: { menuIds: string[]} = req.body;

    await prisma.menu.deleteMany({
      where: { tenantId: tenantReq.tenant.id, id: { in: menuIds } },
    });

    res.status(200).json({ message: "Menu deleted successfully" });
  },

  addItemsToMenu: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;
    const { menuId } = req.params;

    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        tenantId: tenantReq.tenant.id,
      },
    });

    if (!menu) {
      res.status(404).json({ error: "Menu not found for this tenant" });
      return;
    }

    const { ids } = req.body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every((id) => typeof id === "string")
    ) {
      res
        .status(400)
        .json({ error: "Missing or invalid menuItem ids in body" });
      return;
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: ids } },
    });

    if (menuItems.length !== ids.length) {
      res.status(404).json({ error: "One or more MenuItems not found" });
      return;
    }

    const alreadyLinked = await prisma.menuItemsOnMenus.findMany({
      where: {
        menuId: menu.id,
        menuItemId: { in: ids },
      },
    });

    const alreadyLinkedIds = alreadyLinked.map((i) => i.menuItemId);
    const toLinkIds = ids.filter((id) => !alreadyLinkedIds.includes(id));

    if (toLinkIds.length === 0) {
      res
        .status(409)
        .json({ error: "All MenuItems already linked to this menu." });
      return;
    }

    await prisma.menuItemsOnMenus.createMany({
      data: toLinkIds.map((menuItemId) => ({
        menuId: menu.id,
        menuItemId,
      })),
    });

    res
      .status(201)
      .json({
        message: "MenuItems added to menu successfully",
        added: toLinkIds,
      });
  },

  removeItemsFromMenu: async (req: Request, res: Response) => {
    const tenantReq = req as TenantRequest;
    const { menuId } = req.params;

    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        tenantId: tenantReq.tenant.id,
      },
    });

    if (!menu) {
      res.status(404).json({ error: "Menu not found for this tenant" });
      return;
    }

    const { ids } = req.body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every((id) => typeof id === "string")
    ) {
      res
        .status(400)
        .json({ error: "Missing or invalid menuItem ids in body" });
      return;
    }

    const foundItems = await prisma.menuItem.findMany({
      where: { id: { in: ids } },
    });

    if (foundItems.length !== ids.length) {
      res.status(404).json({ error: "One or more MenuItems not found" });
      return;
    }

    const toDelete = await prisma.menuItemsOnMenus.findMany({
      where: {
        menuId: menu.id,
        menuItemId: { in: ids },
      },
    });

    await prisma.menuItemsOnMenus.deleteMany({
      where: {
        menuId: menu.id,
        menuItemId: { in: ids },
      },
    });

    res.status(200).json({
      message: "MenuItems removed from menu successfully",
      removed: toDelete.map((item) => item.menuItemId),
      notFound: ids.filter(
        (id) => !toDelete.some((item) => item.menuItemId === id)
      ),
    });
  },
};

export default menuController;

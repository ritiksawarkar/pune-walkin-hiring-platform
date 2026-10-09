/**
 * Company Profile Service
 * Front-end mock service providing company management operations
 */

import { storageService } from "./storageService";

export const companyService = {
  async getCompanyProfile() {
    // Simulate lightweight async response
    await new Promise((r) => setTimeout(r, 80));
    return storageService.getCompany();
  },

  async updateCompanyProfile(data) {
    await new Promise((r) => setTimeout(r, 120));
    const current = storageService.getCompany();
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    storageService.setCompany(updated);
    storageService.addActivity({
      type: "company_update",
      title: "Company Profile Updated",
      description: `Updated corporate details for ${updated.name}`,
      entityId: updated.id,
    });
    return updated;
  },
};

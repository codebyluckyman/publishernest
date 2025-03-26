
import { NextApiRequest, NextApiResponse } from "next";
import { fetchProductionSteps } from "@/api/organizations/productionSteps";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Organization ID is required" });
  }

  try {
    const productionSteps = await fetchProductionSteps(id);
    return res.status(200).json({ data: productionSteps });
  } catch (error: any) {
    console.error("Error in production steps API:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch production steps" });
  }
}
